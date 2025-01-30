import asyncio
from datetime import datetime
from functools import lru_cache, wraps
import json
import logging
import os
from pathlib import Path
from secrets import randbelow
from typing import Any, Callable, Dict, List, Optional

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import google.generativeai as genai_lib
from pydantic import BaseModel, Field, field_validator
from tenacity import retry, stop_after_attempt, wait_exponential

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Constants
API_KEY_FILE = "api_key.txt"
VALID_DIVINATION_MODES = {"yarrow", "coins", "random"}
MIN_HEXAGRAM_NUMBER = 1
MAX_HEXAGRAM_NUMBER = 64
MIN_LINE_NUMBER = 1
MAX_LINE_NUMBER = 6
YIN_LINES = ("6", "8")
YANG_LINES = ("7", "9")
CHANGING_LINES = ("6", "9")


# Custom Exceptions
class APIException(HTTPException):
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)


class GeminiAPIException(APIException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail
        )


class RateLimitException(APIException):
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=detail)


class HexagramNotFoundException(APIException):
    def __init__(self, hexagram_number: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hexagram {hexagram_number} not found",
        )


class InvalidModeException(APIException):
    def __init__(self, mode: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid mode: {mode}"
        )


class InvalidLineNumberException(APIException):
    def __init__(self, line_number: int):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid line number: {line_number}",
        )


class MissingDataException(APIException):
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class InvalidJSONResponseException(APIException):
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

class ConfigurationError(APIException): # Define a custom exception for configuration issues
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)


# Global Exception Handler
async def exception_handler(request: Request, exc: APIException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


# Configuration
class Config:
    API_KEY_FILE: str = "api_key.txt"
    PROMPTS_FILE: Path = Path(__file__).resolve().parent / "data" / "prompts.json"
    HEXAGRAMS_FILE: Path = Path(__file__).resolve().parent / "data" / "hexagrams.json"
    DEFAULT_SYSTEM_PROMPT: str = "You are a master I Ching scholar and diviner..."
    DEFAULT_TIMEOUT = 30
    MAX_RETRIES = 3
    MAX_TOKENS = 1000
    RATE_LIMIT = 10  # requests per minute

    @classmethod
    def load_api_key(cls) -> str:
        if os.path.exists(cls.API_KEY_FILE):
            with open(cls.API_KEY_FILE) as file:
                return file.read().strip()
        api_key = input("Enter your Gemini API key: ")
        with open(cls.API_KEY_FILE, "w") as file:
            file.write(api_key)
        return api_key

    @classmethod
    def load_hexagrams(cls) -> Dict:
        if not os.path.exists(cls.HEXAGRAMS_FILE):
            logger.warning("Hexagrams file not found, using default data")
            return {
                1: HexagramData(
                    number=1,
                    name="Force",
                    englishName="Force",
                    chinese="乾",
                    description="Heaven above, heaven below",
                    judgment=TextWithExplanation(text="Default Judgment"),
                    image=TextWithExplanation(text="Default Image"),
                )
            }
        with open(cls.HEXAGRAMS_FILE, encoding="utf-8") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError as e:
                logger.error(f"Error decoding hexagrams JSON: {e}")
                raise ConfigurationError(f"Invalid JSON format in hexagrams file: {e}") # Raise ConfigurationError
            except Exception as e: # Catch other potential file errors
                logger.error(f"Error loading hexagrams file: {e}")
                raise ConfigurationError(f"Error loading hexagrams data: {e}") # Raise ConfigurationError


    @classmethod
    def load_prompts(cls) -> Dict[str, str]:
        if not os.path.exists(cls.PROMPTS_FILE):
            logger.warning("Prompts file not found, using defaults")
            return {
                "system_prompt": cls.DEFAULT_SYSTEM_PROMPT,
                "interpret_reading": "Interpret hexagram {hexagram_number}...",
                "enhanced_prompt": "Provide enhanced interpretation...",
            }
        try:
            with open(cls.PROMPTS_FILE, encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError as e:
            logger.error(f"Error decoding prompts JSON: {e}")
            return { # Return defaults instead of raising error, as prompts are less critical
                "system_prompt": cls.DEFAULT_SYSTEM_PROMPT,
                "interpret_reading": "Interpret hexagram {hexagram_number}...",
                "enhanced_prompt": "Provide enhanced interpretation...",
            }
        except FileNotFoundError:
            logger.warning("Prompts file not found, using defaults.")
            return { # Return defaults if file not found
                "system_prompt": cls.DEFAULT_SYSTEM_PROMPT,
                "interpret_reading": "Interpret hexagram {hexagram_number}...",
                "enhanced_prompt": "Provide enhanced interpretation...",
            }


# Data Models
class TextWithExplanation(BaseModel):
    text: str
    explanation: Optional[str] = None


class TrigramData(BaseModel):
    name: str
    chinese: str = ""
    attribute: str = ""
    element: str = ""

    @field_validator("name")
    def validate_name(cls, v):
        if not v:
            return "unknown"
        return v


class NuclearData(BaseModel):
    hexagram: Optional[int] = None
    line: Optional[int] = None


class HexagramData(BaseModel):
    number: int
    name: str
    englishName: str
    chinese: str
    description: str
    element: str = "N/A"
    attribute: str = "N/A"
    judgment: TextWithExplanation
    image: TextWithExplanation
    nuclear: NuclearData
    reversed: Optional[int] = None
    opposite: Optional[int] = None
    lines: List[str] = Field(default_factory=list)
    trigrams: Dict[str, TrigramData] = Field(default_factory=dict)

    @field_validator("number")
    def validate_number(cls, v):
        if not MIN_HEXAGRAM_NUMBER <= v <= MAX_HEXAGRAM_NUMBER:
            raise ValueError(
                f"Hexagram number must be between {MIN_HEXAGRAM_NUMBER} and {MAX_HEXAGRAM_NUMBER}"
            )
        return v


class Line(BaseModel):
    lineNumber: int = Field(..., ge=1, le=6)
    type: str = Field(..., enum=["yin", "yang"])
    meaning: str
    isChanging: bool
    changingLineMeaning: Optional[str] = None
    commentary: Optional[List[str]] = None


class TrigramSignificance(BaseModel):
    upper: str
    lower: str
    relationship: str


class PrimaryHexagram(BaseModel):
    number: int = Field(..., ge=1, le=64)
    name: str
    chinese_name: str
    judgment: str
    image: str
    lines: List[Line]
    upper_trigram: str
    lower_trigram: str
    trigram_significance: Optional[TrigramSignificance] = None
    commentary: Optional[List[str]] = None
    changing_lines: List[int] = []


class RelatingHexagram(BaseModel):
    number: int
    name: str
    chinese: str
    description: str = ""
    judgment: str = ""
    image: str = ""
    commentary: Optional[List[str]] = None

    @classmethod
    def from_primary_hexagram(cls, hexagram: PrimaryHexagram) -> "RelatingHexagram":
        """
        Creates a RelatingHexagram from a PrimaryHexagram.
        This is useful for converting between the two model types.
        """
        return cls(
            number=hexagram.number,
            name=hexagram.name,
            chinese=hexagram.chinese_name,
            description=hexagram.image,
            judgment=hexagram.judgment,
            image=hexagram.image,
            commentary=hexagram.commentary,
        )


class ReadingResponse(BaseModel):
    hexagram_number: int = Field(..., ge=MIN_HEXAGRAM_NUMBER, le=MAX_HEXAGRAM_NUMBER)
    changing_lines: List[int] = Field(default_factory=list)
    lines: List[int] = Field(..., min_items=MAX_LINE_NUMBER, max_items=MAX_LINE_NUMBER)
    reading: HexagramData
    relating_hexagram: Optional[RelatingHexagram] = None # Optional as there might not be relating hexagram
    has_ai_interpretation: bool = False
    ai_interpretation_available: bool = True

    @field_validator("changing_lines")
    def validate_changing_lines(cls, v):
        if not all(MIN_LINE_NUMBER <= x <= MAX_LINE_NUMBER for x in v):
            raise ValueError(
                f"Changing lines must be between {MIN_LINE_NUMBER} and {MAX_LINE_NUMBER}"
            )
        return v


class Message(BaseModel): # Keeping Message for chat functionality, but removed from_primary_hexagram
    role: str
    content: str

    @field_validator("content")
    def validate_content(cls, v):
        if not v.strip():
            raise ValueError("Message content cannot be empty")
        return v


class DivinationRequest(BaseModel):
    mode: str = Field(..., description="The divination mode to use")

    @field_validator("mode")
    def validate_mode(cls, v):
        if v not in VALID_DIVINATION_MODES:
            raise ValueError(f"Mode must be one of: {VALID_DIVINATION_MODES}")
        return v


class HexagramRequest(BaseModel):
    hexagram_number: int = Field(..., description="The hexagram number to look up")


class ReadingMetadata(BaseModel):
    date: datetime
    method: str = Field(enum=["yarrow stalks", "coins", "online generator"])
    question: Optional[str] = None
    notes: Optional[str] = None


class NuclearHexagram(BaseModel):
    number: int = Field(ge=MIN_HEXAGRAM_NUMBER, le=MAX_HEXAGRAM_NUMBER)
    name: str
    chineseName: Optional[str] = None
    judgment: Optional[str] = None
    image: Optional[str] = None
    commentary: Optional[List[str]] = None


class Interpretation(BaseModel):
    summary: Optional[str] = None
    advice: Optional[str] = None
    potentialOutcomes: Optional[str] = None
    personalReflections: Optional[str] = None


class IChingReading(BaseModel):
    readingMetadata: ReadingMetadata
    primaryHexagram: PrimaryHexagram
    relatingHexagram: Optional[RelatingHexagram] = None
    nuclearHexagrams: Optional[List[NuclearHexagram]] = None
    interpretation: Optional[Interpretation] = None


class GeminiGenerateContentRequest(BaseModel):
    contents: List[dict]
    tools: Optional[List[dict]] = None
    generationConfig: Optional[dict] = None
    safetySettings: Optional[List[dict]] = None
    responseMimeType: Optional[str] = None


# Service Interfaces
class GenAIClientInterface:
    async def generate_content(
        self, request: GeminiGenerateContentRequest
    ) -> IChingReading:
        raise NotImplementedError


class HexagramServiceInterface:
    def _load_hexagrams(self) -> Dict[int, PrimaryHexagram]:
        raise NotImplementedError

    def _convert_hexagram_data(self, hexagram: Dict) -> PrimaryHexagram:
        raise NotImplementedError


class ReadingServiceInterface:
    async def generate_reading(self, mode: str) -> ReadingResponse:
        raise NotImplementedError

    async def interpret_reading(self, reading: ReadingResponse) -> str:
        raise NotImplementedError


class InterpretationServiceInterface:
    async def interpret_hexagram(self, hexagram: PrimaryHexagram) -> str:
        raise NotImplementedError

    async def interpret_line(
        self, hexagram_number: int, line_number: int, line_text: str
    ) -> str:
        raise NotImplementedError


class ChatServiceInterface:
    async def process_message(self, message: Message) -> str:
        raise NotImplementedError


# Decorator for KeyError Handling
def handle_key_error(func: Callable) -> Callable:
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except KeyError as e:
            logger.error(f"KeyError accessing data: {e}")
            raise HexagramNotFoundException(e.args[0])

    return wrapper


# Gemini API Client
class GenAIClient(GenAIClientInterface):
    def __init__(self):
        self.api_key = Config.load_api_key()
        genai_lib.configure(api_key=self.api_key)
        self.model = genai_lib.GenerativeModel("gemini-pro")
        self.prompts = self._load_prompts()
        self._setup_retry_config()
        self._lock = asyncio.Lock()

    def _setup_retry_config(self):
        self.max_retries = Config.MAX_RETRIES
        self.initial_retry_delay = 2
        self.max_retry_delay = 60

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=2, min=4, max=60),
        reraise=True,
    )
    async def _generate_content_impl(
        self, request: GeminiGenerateContentRequest
    ) -> IChingReading:
        try:
            # Generate content using the Gemini API
            generation_config = request.generationConfig or {}
            safety_settings = request.safetySettings or []

            response = self.model.generate_content(
                contents=request.contents,
                generation_config=generation_config,
                safety_settings=safety_settings,
            )

            # Check for errors in response
            if not response or not response.text:
                raise MissingDataException("Empty response from Gemini API")

            # Extract and clean the JSON string from the response
            json_text = response.text.strip()
            if json_text.startswith("```json"):
                json_text = json_text[7:]
            if json_text.endswith("```"):
                json_text = json_text[:-3]

            try:
                # Parse the JSON string into a dictionary first
                data_dict = json.loads(json_text)

                # Convert date string to datetime object
                if (
                    "readingMetadata" in data_dict
                    and "date" in data_dict["readingMetadata"]
                ):
                    data_dict["readingMetadata"]["date"] = datetime.fromisoformat(
                        data_dict["readingMetadata"]["date"].replace("Z", "+00:00")
                    )

                # Validate and create IChingReading object
                iching_data = IChingReading.model_validate(data_dict)
                return iching_data

            except json.JSONDecodeError as je:
                logger.error(f"JSON decode error: {je}")
                raise InvalidJSONResponseException(f"Invalid JSON format: {je}")
            except ValueError as ve:
                logger.error(f"Validation error: {ve}")
                raise InvalidJSONResponseException(
                    f"Failed to validate response data: {ve}"
                )

        except Exception as e:
            logger.error(f"Error generating content: {e}")
            if "quota" in str(e).lower() or "429" in str(e):
                raise RateLimitException(
                    detail="Rate limit exceeded. Please try again later."
                )
            raise GeminiAPIException(detail=str(e))

    async def generate_content(
        self, request: GeminiGenerateContentRequest
    ) -> IChingReading:
        async with self._lock:  # Prevent concurrent API key usage issues
            return await self._generate_content_impl(request)

    def _load_prompts(self) -> Dict[str, str]:
        try:
            return Config.load_prompts()
        except Exception as e:
            logger.warning(f"Error loading prompts: {e}. Using defaults.")
            return {
                "system_prompt": Config.DEFAULT_SYSTEM_PROMPT,
                "enhanced_prompt": "You are a master I Ching scholar and interpreter...",
                "chat_prompt": "You are an expert I Ching consultant...",
            }


# Hexagram Service
class HexagramService(HexagramServiceInterface):
    def __init__(self):
        self.hexagrams = self._load_hexagrams()

    @lru_cache(maxsize=128)
    def _load_hexagrams(self) -> Dict[int, PrimaryHexagram]:
        logger.info("Loading hexagrams...")
        try:
            data = Config.load_hexagrams()
            logger.info(f"Loaded {len(data)} hexagrams")
            hexagrams = {h["number"]: self._convert_hexagram_data(h) for h in data}
            logger.info("Hexagrams loaded successfully.")
            return hexagrams
        except json.JSONDecodeError as e:
            logger.error(f"Error decoding hexagrams JSON: {e}")
            raise ConfigurationError(f"Invalid JSON format in hexagrams file: {e}") # Raise ConfigurationError
        except FileNotFoundError:
            logger.error("Hexagrams file not found.")
            raise ConfigurationError("Hexagrams data file not found.") # Raise ConfigurationError
        except ConfigurationError: # Re-raise ConfigurationError to be handled upstream
            raise
        except Exception as e:
            logger.error(f"Error loading hexagrams: {e}")
            raise GeminiAPIException(detail="Failed to load hexagram data")

    def _convert_hexagram_data(self, hexagram: Dict) -> PrimaryHexagram:
        try:
            logger.debug(f"Converting hexagram data: {hexagram}")

            # Convert the raw line data to Line objects
            hex_lines = []
            for line_data in hexagram.get("lines", []):
                hex_lines.append(
                    Line(
                        lineNumber=line_data["lineNumber"],
                        type="yin"
                        if "yin" in line_data.get("type", "").lower()
                        else "yang",
                        meaning=line_data["meaning"],
                        isChanging=False,  # This will be set later if needed
                        changingLineMeaning=None,
                        commentary=None,
                    )
                )

            # Create the hexagram data object with proper field mapping
            hexagram_data = PrimaryHexagram(
                number=hexagram["number"],
                name=hexagram["name"],
                chinese_name=hexagram["chineseName"],
                judgment=hexagram["judgment"],
                image=hexagram["image"],
                lines=hex_lines,
                upper_trigram=hexagram["upperTrigram"],
                lower_trigram=hexagram["lowerTrigram"],
                trigram_significance=TrigramSignificance(
                    upper=hexagram.get("trigramSignificance", {}).get(
                        "upper", "unknown"
                    ),
                    lower=hexagram.get("trigramSignificance", {}).get(
                        "lower", "unknown"
                    ),
                    relationship=hexagram.get("trigramSignificance", {}).get(
                        "relationship", "unknown"
                    ),
                )
                if "trigramSignificance" in hexagram
                else None,
                commentary=hexagram.get("commentary", []),
                changing_lines=[],
            )

            if len(hex_lines) != 6:
                raise ValueError(f"Expected 6 lines, got {len(hex_lines)}")

            return hexagram_data

        except KeyError as e:
            logger.error(
                f"KeyError converting hexagram data: {e} - hexagram: {hexagram}"
            )
            raise ValueError(f"Missing required field: {str(e)}")
        except Exception as e:
            logger.error(f"Error converting hexagram data: {e} - hexagram: {hexagram}")
            raise ValueError(f"Error converting hexagram data: {str(e)}")

    def convert_to_hexagram_data(self, hexagram: PrimaryHexagram) -> HexagramData:
        """Convert PrimaryHexagram to HexagramData"""
        return HexagramData(
            number=hexagram.number,
            name=hexagram.name,
            englishName=hexagram.name,  # Using name as englishName
            chinese=hexagram.chinese_name,
            description=hexagram.image,  # Using image as description
            element="Unknown",  # Provide default value
            attribute="Unknown",  # Provide default value
            judgment=TextWithExplanation(text=hexagram.judgment),
            image=TextWithExplanation(text=hexagram.image),
            nuclear=NuclearData(),  # Empty nuclear data
            lines=[line.meaning for line in hexagram.lines],
            trigrams={
                "upper": TrigramData(name=hexagram.upper_trigram),
                "lower": TrigramData(name=hexagram.lower_trigram),
            },
        )

    def convert_to_relating_hexagram(
        self, hexagram: PrimaryHexagram
    ) -> RelatingHexagram:
        """Convert PrimaryHexagram to RelatingHexagram"""
        return RelatingHexagram(
            number=hexagram.number,
            name=hexagram.name,
            chinese=hexagram.chinese_name,
            description=hexagram.image,  # Use image as description
            judgment=hexagram.judgment,
            image=hexagram.image,
            commentary=hexagram.commentary or [],
        )


# Reading Service
class ReadingService(ReadingServiceInterface):
    def __init__(self, genai_client: Optional[GenAIClient] = None):
        self.genai_client = genai_client
        self.hexagram_service = HexagramService()

    def _generate_yarrow_line(self) -> int:
        """
        Simulates the traditional yarrow stalk method to generate a single line.
        Following the traditional probabilities:
        6 (old yin) - probability 1/16
        7 (young yang) - probability 5/16
        8 (young yin) - probability 7/16
        9 (old yang) - probability 3/16
        """
        import random

        # Initial pile of 50 stalks (minus 1 set aside)
        stalks = 49

        # First division
        west = random.randint(1, stalks - 1)
        east = stalks - west - 1

        # Set aside stalks from each pile in sets of 4
        west_remainder = west % 4 if west % 4 != 0 else 4
        east_remainder = east % 4 if east % 4 != 0 else 4
        first_count = west_remainder + east_remainder

        # Second division
        remaining = stalks - first_count - 1
        west = random.randint(1, remaining - 1)
        east = remaining - west

        # Set aside stalks from each pile in sets of 4
        west_remainder = west % 4 if west % 4 != 0 else 4
        east_remainder = east % 4 if east % 4 != 0 else 4
        second_count = west_remainder + east_remainder

        # Third division
        remaining = remaining - second_count - 1
        west = random.randint(1, remaining - 1)
        east = remaining - west

        # Set aside stalks from each pile in sets of 4
        west_remainder = west % 4 if west % 4 != 0 else 4
        east_remainder = east % 4 if east % 4 != 0 else 4
        third_count = west_remainder + east_remainder

        # Calculate line value based on total
        total = first_count + second_count + third_count

        # Map the totals to line values according to traditional probabilities
        if total == 24:
            return 9  # old yang
        elif total in (28, 32):
            return 7  # young yang
        elif total in (33, 37, 41):
            return 8  # young yin
        return 6  # old yin (default case)

    def _generate_coin_lines(self) -> List[int]:
        import random

        lines = []
        for i in range(MAX_LINE_NUMBER):
            heads = 0
            for _ in range(3):
                if random.random() > 0.5:
                    heads += 1
            if heads == 0:
                lines.append(6)
            elif heads == 1:
                lines.append(7)
            elif heads == 2:
                lines.append(8)
            else:
                lines.append(9)
        return lines

    def _calculate_hexagram_number(self, lines: List[int]) -> int:
        """Calculate hexagram number from lines"""
        binary_string = "".join([
            "1" if str(line) in YANG_LINES else "0" for line in lines
        ])
        number = int(binary_string, 2)
        return (number % MAX_HEXAGRAM_NUMBER) + MIN_HEXAGRAM_NUMBER

    def _calculate_relating_hexagram_number(
        self, lines: List[int], changing_lines: List[int]
    ) -> int:
        """Calculate relating hexagram number"""
        new_lines = lines.copy()
        for pos in changing_lines:
            idx = pos - 1
            new_lines[idx] = 7 if str(lines[idx]) in YIN_LINES else 8
        return self._calculate_hexagram_number(new_lines)

    @handle_key_error
    async def generate_reading(self, mode: str) -> ReadingResponse:
        """
        Generate initial reading without AI interpretation.

        The relating_hexagram field in the response will be populated only if there are changing lines.
        """
        logger.info(f"Generating reading: mode={mode}")
        try:
            if not self.hexagram_service.hexagrams:
                raise ValueError("No hexagram data available")

            lines = []
            changing_lines = []
            hexagram_number = 0

            # Generate lines based on mode
            if mode == "yarrow":
                lines = [self._generate_yarrow_line() for _ in range(6)]
            elif mode == "random":
                lines = [6 + randbelow(4) for _ in range(6)]
            elif mode == "coins":
                lines = self._generate_coin_lines()
            else:
                raise InvalidModeException(mode)

            # Calculate changing lines and hexagram number
            changing_lines = [
                i + 1 for i, line in enumerate(lines) if str(line) in CHANGING_LINES
            ]
            hexagram_number = self._calculate_hexagram_number(lines)

            # Get hexagram data from local storage
            try:
                primary_hexagram = self.hexagram_service.hexagrams[hexagram_number]
                hexagram_data = self.hexagram_service.convert_to_hexagram_data(
                    primary_hexagram
                )
            except Exception as e:
                logger.error(f"Error converting primary hexagram: {e}")
                raise ValueError(f"Failed to convert primary hexagram: {str(e)}")

            relating_hexagram = None # Initialize to None
            if changing_lines: # Only calculate and include relating hexagram if there are changing lines
                try:
                    # Calculate relating hexagram if there are changing lines
                    relating_number = self._calculate_relating_hexagram_number(
                        lines, changing_lines
                    )
                    relating_primary = self.hexagram_service.hexagrams.get(
                        relating_number
                    )
                    if relating_primary:
                        relating_hexagram = RelatingHexagram.from_primary_hexagram(
                            relating_primary
                        )
                except Exception as e:
                    logger.error(f"Error converting relating hexagram: {e}")
                    # Don't fail the whole request if relating hexagram fails
                    relating_hexagram = None

            try:
                response = ReadingResponse(
                    hexagram_number=hexagram_number,
                    changing_lines=changing_lines,
                    lines=lines,
                    reading=hexagram_data,
                    relating_hexagram=relating_hexagram, # relating_hexagram will be None if no changing lines
                    has_ai_interpretation=False,
                    ai_interpretation_available=bool(self.genai_client),
                )
                return response
            except Exception as e:
                logger.error(f"Error creating ReadingResponse: {e}")
                raise ValueError(f"Failed to create reading response: {str(e)}")

        except Exception as e:
            logger.error(f"Reading generation failed: {e}", exc_info=True)
            raise

    @handle_key_error
    async def interpret_reading(self, reading: ReadingResponse) -> str:
        judgment_text = reading.reading.judgment
        image_text = reading.reading.image
        changing_lines_text = (
            "Changing Lines: " + ", ".join(map(str, reading.changing_lines))
            if reading.changing_lines
            else "No changing lines"
        )
        relating_hexagram_text = ""
        if reading.relating_hexagram:
            relating_hexagram_text = (
                f"Relating Hexagram: {reading.relating_hexagram.number} - "
                f"{reading.relating_hexagram.name} ({reading.relating_hexagram.chineseName})\n"
                f"Description: {reading.relating_hexagram.judgment}"
            )

        prompt = self.genai_client.prompts.get("interpret_reading").format(
            hexagram_number=reading.hexagram_number,
            hexagram_name=reading.reading.name,
            hexagram_chinese=reading.reading.chineseName,
            hexagram_description=reading.reading.description,
            hexagram_judgment=judgment_text,
            hexagram_image=image_text,
            changing_lines_text=changing_lines_text,
            relating_hexagram_text=relating_hexagram_text,
        )
        gemini_request = GeminiGenerateContentRequest(
            contents=[{"parts": [{"text": prompt}]}]
        )
        raw_response = await self.genai_client.generate_content(gemini_request)
        sanitized_response = " ".join(raw_response.interpretation.summary.split())[
            :2000
        ]
        return sanitized_response


# Interpretation Service
class InterpretationService(InterpretationServiceInterface):
    def __init__(self, genai_client: GenAIClient):
        self.genai_client = genai_client

    @handle_key_error
    async def interpret_hexagram(self, hexagram: PrimaryHexagram) -> str:
        if not hexagram:
            raise HexagramNotFoundException(hexagram.number)

        try:
            prompt = f"""
            Interpret hexagram {hexagram.number} ({hexagram.name})
            Chinese Name: {hexagram.chineseName}
            Judgment: {hexagram.judgment}
            Image: {hexagram.image}
            Upper Trigram: {hexagram.upperTrigram}
            Lower Trigram: {hexagram.lowerTrigram}
            """
            gemini_request = GeminiGenerateContentRequest(
                contents=[{"parts": [{"text": prompt}]}]
            )
            raw_response = await self.genai_client.generate_content(gemini_request)
            sanitized_response = " ".join(raw_response.interpretation.summary.split())[
                :2000
            ]
            return sanitized_response
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error interpreting hexagram: {e}")
            raise GeminiAPIException(detail=f"Failed to interpret hexagram: {str(e)}")

    @handle_key_error
    async def interpret_line(
        self, hexagram_number: int, line_number: int, line_text: str
    ) -> str:
        try:
            prompt = f"""
            Interpret line {line_number} of hexagram {hexagram_number}:
            "{line_text}"
            """
            gemini_request = GeminiGenerateContentRequest(
                contents=[{"parts": [{"text": prompt}]}]
            )
            raw_response = await self.genai_client.generate_content(gemini_request)
            sanitized_response = " ".join(raw_response.interpretation.summary.split())[
                :2000
            ]
            return sanitized_response
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error interpreting line: {e}")
            raise GeminiAPIException(detail=f"Failed to interpret line: {str(e)}")


# Chat Service
class ChatService(ChatServiceInterface):
    def __init__(self, genai_client: GenAIClient):
        self.genai_client = genai_client

    async def process_message(self, message: Message) -> str:
        gemini_request = GeminiGenerateContentRequest(
            contents=[{"parts": [{"text": message.content}]}]
        )
        raw_response = await self.genai_client.generate_content(gemini_request)
        sanitized_response = " ".join(raw_response.interpretation.summary.split())[
            :2000
        ]
        return sanitized_response


# FastAPI app setup
app = FastAPI(title="I Ching API", exception_handlers={APIException: exception_handler})

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency injection
def get_genai_client() -> GenAIClient:
    return GenAIClient()


def get_reading_service(
    genai_client: GenAIClient = Depends(get_genai_client),
) -> ReadingService:
    return ReadingService(genai_client)


def get_interpretation_service(
    genai_client: GenAIClient = Depends(get_genai_client),
) -> InterpretationService:
    return InterpretationService(genai_client)


def get_chat_service(
    genai_client: GenAIClient = Depends(get_genai_client),
) -> ChatService:
    return ChatService(genai_client)


# Routes
@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/hexagrams/generate", response_model=Dict[str, Any])
async def generate_reading(
    request: DivinationRequest,
    reading_service: ReadingService = Depends(get_reading_service),
):
    """Generate initial reading without AI interpretation"""
    try:
        reading = await reading_service.generate_reading(request.mode)
        return {
            "success": True,
            "data": reading.model_dump(),
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Reading generation error: {e}")
        raise GeminiAPIException(detail=str(e))


@app.post("/hexagrams/{number}", response_model=PrimaryHexagram)
def get_hexagram(number: int):
    hexagram_service = HexagramService()
    try:
        return hexagram_service.hexagrams[number]
    except KeyError:
        raise HexagramNotFoundException(number)


@app.post("/interpretations/hexagram", response_model=Dict[str, Any])
async def interpret_hexagram(
    request: HexagramRequest,
    interpretation_service: InterpretationService = Depends(get_interpretation_service),
):
    hexagram_service = HexagramService()
    try:
        hexagram = hexagram_service.hexagrams[request.hexagram_number]
        interpretation = await interpretation_service.interpret_hexagram(hexagram)
        return {"success": True, "data": {"interpretation": interpretation}}
    except KeyError as e:
        logger.error(f"KeyError accessing hexagram {request.hexagram_number}: {e}")
        raise HexagramNotFoundException(request.hexagram_number)
    except Exception as e:
        logger.error(f"Error interpreting hexagram: {e}")
        raise GeminiAPIException(detail=str(e))


@app.post("/interpretations/line", response_model=Dict[str, Any])
async def interpret_line(
    request: dict,
    interpretation_service: InterpretationService = Depends(get_interpretation_service),
):
    try:
        hexagram_service = HexagramService()
        hexagram_number = request.get("hexagram_number")
        line_number = request.get("line_number")

        if not hexagram_number or not line_number:
            raise MissingDataException("Missing hexagram_number or line_number")

        hexagram = hexagram_service.hexagrams.get(hexagram_number)
        if not hexagram:
            raise HexagramNotFoundException(hexagram_number)

        if not hexagram.lines or not MIN_LINE_NUMBER <= line_number <= len(
            hexagram.lines
        ):
            raise InvalidLineNumberException(line_number)

        line = hexagram.lines[line_number - 1]
        interpretation = await interpretation_service.interpret_line(
            hexagram_number, line_number, line.meaning
        )

        return {
            "success": True,
            "data": {
                "position": line_number,
                "line": line,
                "interpretation": interpretation,
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in line interpretation endpoint: {e}")
        raise GeminiAPIException(detail=str(e))


@app.post("/interpretations/comprehensive", response_model=Dict[str, Any])
async def interpret_comprehensive(
    reading: ReadingResponse,
    reading_service: ReadingService = Depends(get_reading_service),
    interpretation_service: InterpretationService = Depends(get_interpretation_service),
):
    try:
        basic_interpretation = await reading_service.interpret_reading(reading)
        changing_line_interpretations = {}
        for line_number in reading.changing_lines:
            line = reading.reading.lines[line_number - 1]
            changing_line_interpretations[
                line_number
            ] = await interpretation_service.interpret_line(
                reading.hexagram_number, line_number, line.meaning
            )

        return {
            "basic": basic_interpretation,
            "changingLines": changing_line_interpretations,
        }
    except Exception as e:
        logger.error(f"Error interpreting comprehensive reading: {e}")
        raise GeminiAPIException(detail=str(e))


@app.post("/chat/start", response_model=Dict[str, Any])
def start_chat():
    return {
        "message": "Welcome to the I Ching consultation. How may I assist you today?"
    }


@app.post("/chat/message", response_model=Dict[str, Any])
async def chat_message(
    message: Message, chat_service: ChatService = Depends(get_chat_service)
):
    try:
        response = await chat_service.process_message(message)
        return {"success": True, "data": {"message": response}}
    except Exception as e:
        logger.error(f"Error in chat: {e}")
        raise GeminiAPIException(detail=str(e))


@app.post("/chat/enhanced", response_model=Dict[str, Any])
async def enhanced_interpretation(
    request: HexagramRequest,
    interpretation_service: InterpretationService = Depends(get_interpretation_service),
):
    try:
        hexagram_service = HexagramService()
        hexagram = hexagram_service.hexagrams[request.hexagram_number]
        prompt = self.genai_client.prompts.get("enhanced_prompt").format(
            hexagram_number=hexagram.number,
            hexagram_name=hexagram.name,
            hexagram_chinese=hexagram.chinese_name,
            hexagram_judgment=hexagram.judgment,
            hexagram_image=hexagram.image,
        )
        gemini_request = GeminiGenerateContentRequest(
            contents=[{"parts": [{"text": prompt}]}]
        )
        raw_response = await self.genai_client.generate_content(gemini_request)
        sanitized_response = " ".join(raw_response.interpretation.summary.split())[
            :2000
        ]
        return {"success": True, "data": {"interpretation": sanitized_response}}
    except KeyError:
        raise HexagramNotFoundException(request.hexagram_number)
    except Exception as e:
        logger.error(f"Error in enhanced interpretation: {e}")
        raise GeminiAPIException(detail=str(e))


@app.post("/hexagrams/{reading_id}/interpret", response_model=Dict[str, Any])
async def interpret_reading(
    reading_id: str,
    reading: ReadingResponse,
    interpretation_service: InterpretationService = Depends(get_interpretation_service),
):
    """Generate AI interpretation for an existing reading"""
    try:
        interpretation = await interpretation_service.interpret_hexagram(
            reading.reading
        )
        return {
            "success": True,
            "data": {
                "reading_id": reading_id,
                "interpretation": interpretation,
            },
        }
    except Exception as e:
        logger.error(f"Error generating AI interpretation: {e}")
        raise GeminiAPIException(detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)