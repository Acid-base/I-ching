import json
import logging
import os
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional

import google.generativeai as genai_lib
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from tenacity import retry, stop_after_attempt, wait_exponential

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Constants
API_KEY_FILE = "api_key.txt"
VALID_DIVINATION_MODES = {"yarrow", "coins", "random"}


class Config:
    API_KEY_FILE: str = "api_key.txt"
    PROMPTS_FILE: Path = Path(__file__).resolve().parent / "data" / "prompts.json"
    HEXAGRAMS_FILE: Path = Path(__file__).resolve().parent / "data" / "hexagrams.json"
    DEFAULT_SYSTEM_PROMPT: str = "You are a master I Ching scholar and diviner..."

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
                raise ValueError(f"Invalid JSON format in hexagrams file: {e}")

    @classmethod
    def load_prompts(cls) -> Dict[str, str]:
        if not os.path.exists(cls.PROMPTS_FILE):
            logger.warning("Prompts file not found, using defaults")
            return {
                "system_prompt": cls.DEFAULT_SYSTEM_PROMPT,
                "interpret_reading": "Interpret hexagram {hexagram_number}...",
                "enhanced_prompt": "Provide enhanced interpretation...",
            }
        with open(cls.PROMPTS_FILE, encoding="utf-8") as f:
            return json.load(f)


class TextWithExplanation(BaseModel):
    text: str
    explanation: Optional[str] = None


class TrigramData(BaseModel):
    name: str
    chinese: str = ""
    attribute: str = ""
    element: str = ""

    @validator("name")
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

    @validator("number")
    def validate_number(cls, v):
        if not 1 <= v <= 64:
            raise ValueError("Hexagram number must be between 1 and 64")
        return v


class RelatingHexagram(BaseModel):
    number: int
    name: str
    chinese: str
    description: str


class ReadingResponse(BaseModel):
    hexagram_number: int
    changing_lines: List[int]
    lines: List[int]
    reading: HexagramData
    relating_hexagram: Optional[RelatingHexagram] = None


class Message(BaseModel):
    role: str
    content: str

    @validator("content")
    def validate_content(cls, v):
        if not v.strip():
            raise ValueError("Message content cannot be empty")
        return v


class DivinationRequest(BaseModel):
    mode: str = Field(..., description="The divination mode to use")


class HexagramRequest(BaseModel):
    hexagram_number: int = Field(..., description="The hexagram number to look up")


class GenAIClient:
    def __init__(self):
        self.api_key = Config.load_api_key()
        genai_lib.configure(api_key=self.api_key)
        self.model = genai_lib.GenerativeModel("gemini-1.5-pro")
        self.prompts = self._load_prompts()
        self._setup_retry_config()

    def _setup_retry_config(self):
        self.max_retries = 3
        self.initial_retry_delay = 2
        self.max_retry_delay = 60

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=2, min=4, max=60),
        reraise=True,
    )
    async def generate_content(self, prompt: str) -> str:
        try:
            response = self.model.generate_content(
                [{"text": self.prompts["system_prompt"]}, {"text": prompt}]
            )
            if not response or not response.text:
                raise ValueError("Empty response from model")
            return response.text
        except Exception as e:
            logger.error(f"Error generating content: {e}")
            if "quota" in str(e).lower() or "429" in str(e):
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Please try again later.",
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e),
            )

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


class HexagramService:
    def __init__(self):
        self.hexagrams = self._load_hexagrams()

    @lru_cache
    def _load_hexagrams(self) -> Dict[int, HexagramData]:
        logger.info("Loading hexagrams...")
        try:
            data = Config.load_hexagrams()
            logger.info(f"Loaded {len(data)} hexagrams")
            hexagrams = {h["number"]: self._convert_hexagram_data(h) for h in data}
            logger.info("Hexagrams loaded successfully.")
            return hexagrams
        except Exception as e:
            logger.error(f"Error loading hexagrams: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to load hexagram data",
            )

    def _convert_hexagram_data(self, hexagram: Dict) -> HexagramData:
        try:
            logger.debug(f"Converting hexagram data: {hexagram}")
            hexagram_data = HexagramData(
                number=hexagram["number"],
                name=hexagram.get("englishName", "N/A"),
                englishName=hexagram.get("englishName", "N/A"),
                chinese=hexagram.get("chineseName", "N/A"),
                description=hexagram.get("description", "N/A"),
                element=hexagram.get("element", "N/A"),
                attribute=hexagram.get("attribute", "N/A"),
                judgment=TextWithExplanation(text=str(hexagram.get("judgment", "N/A"))),
                image=TextWithExplanation(text=str(hexagram.get("image", "N/A"))),
                nuclear=NuclearData(
                    hexagram=hexagram.get("relationships", {}).get("nuclear", [None])[
                        0
                    ],
                    line=hexagram.get("relationships", {}).get("nuclear", [None, None])[
                        1
                    ],
                ),
                reversed=hexagram.get("relationships", {}).get("inverse"),
                opposite=hexagram.get("relationships", {}).get("opposite"),
                lines=hexagram.get("lines", []),
                trigrams={
                    k: TrigramData(**v) if isinstance(v, dict) else TrigramData(name=v)
                    for k, v in hexagram.get("trigrams", {}).items()
                },
            )
            logger.debug(f"Converted hexagram data: {hexagram_data}")
            return hexagram_data
        except KeyError as e:
            logger.error(
                f"KeyError converting hexagram data: {e} - hexagram: {hexagram}"
            )
            raise ValueError(f"KeyError converting hexagram data: {str(e)}")
        except Exception as e:
            logger.error(f"Error converting hexagram data: {e} - hexagram: {hexagram}")
            raise ValueError(f"Error converting hexagram data: {str(e)}")


class ReadingService:
    def __init__(self, genai_client: GenAIClient):
        self.genai_client = genai_client

    async def generate_reading(self, mode: str) -> ReadingResponse:
        logger.info(f"Generating reading with mode: {mode}")
        try:
            hexagram_service = HexagramService()
            if not hexagram_service.hexagrams:
                raise ValueError("No hexagram data available")

            lines = []
            changing_lines = []
            hexagram_number = 0
            if mode == "random":
                import random

                lines = [random.randint(6, 9) for _ in range(6)]
                changing_lines = [
                    i + 1 for i, line in enumerate(lines) if line in (6, 9)
                ]
                hexagram_number = random.randint(1, 64)
            elif mode == "coins":
                import random

                for i in range(6):
                    heads = 0
                    for _ in range(3):
                        if random.random() > 0.5:
                            heads += 1
                    if heads == 0:
                        lines.append(6)
                        changing_lines.append(i + 1)
                    elif heads == 1:
                        lines.append(7)
                    elif heads == 2:
                        lines.append(8)
                    else:
                        lines.append(9)
                        changing_lines.append(i + 1)

                # Convert lines to binary representation
                binary_string = "".join(
                    ["1" if line in (7, 9) else "0" for line in lines]
                )
                hexagram_number = int(binary_string, 2)
                # Ensure the number is within the valid range
                hexagram_number = (hexagram_number % 64) + 1
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid mode: {mode}",
                )

            logger.info(
                f"Generated lines: {lines}, changing lines: {changing_lines}, hexagram number: {hexagram_number}"
            )
            try:
                hexagram = hexagram_service.hexagrams[hexagram_number]
            except KeyError as e:
                logger.error(f"KeyError accessing hexagram {hexagram_number}: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to access hexagram data for hexagram number: {hexagram_number}",
                )

            return ReadingResponse(
                hexagram_number=hexagram_number,
                changing_lines=changing_lines,
                lines=lines,
                reading=hexagram,
            )
        except Exception as e:
            logger.error(f"Reading generation failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def interpret_reading(self, reading: ReadingResponse) -> str:
        judgment_text = reading.reading.judgment.text
        image_text = reading.reading.image.text
        changing_lines_text = (
            "Changing Lines: " + ", ".join(map(str, reading.changing_lines))
            if reading.changing_lines
            else "No changing lines"
        )
        relating_hexagram_text = ""
        if reading.relating_hexagram:
            relating_hexagram_text = (
                f"Relating Hexagram: {reading.relating_hexagram.number} - "
                f"{reading.relating_hexagram.name} ({reading.relating_hexagram.chinese})\n"
                f"Description: {reading.relating_hexagram.description}"
            )

        prompt = self.genai_client.prompts.get("interpret_reading").format(
            hexagram_number=reading.hexagram_number,
            hexagram_name=reading.reading.name,
            hexagram_chinese=reading.reading.chinese,
            hexagram_description=reading.reading.description,
            hexagram_judgment=judgment_text,
            hexagram_image=image_text,
            changing_lines_text=changing_lines_text,
            relating_hexagram_text=relating_hexagram_text,
        )
        return await self.genai_client.generate_content(prompt)


class InterpretationService:
    def __init__(self, genai_client: GenAIClient):
        self.genai_client = genai_client

    async def interpret_hexagram(self, hexagram: HexagramData) -> str:
        if not hexagram:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Hexagram not found"
            )

        try:
            prompt = f"""
            Interpret hexagram {hexagram.number} ({hexagram.englishName})
            Chinese Name: {hexagram.chinese}
            Element: {hexagram.element}
            Attribute: {hexagram.attribute}
            Judgment: {hexagram.judgment.text}
            Image: {hexagram.image.text}
            Upper Trigram: {hexagram.trigrams.get('upper', TrigramData(name='unknown')).name}
            Lower Trigram: {hexagram.trigrams.get('lower', TrigramData(name='unknown')).name}
            """
            return await self.genai_client.generate_content(prompt)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error interpreting hexagram: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to interpret hexagram: {str(e)}",
            )

    async def interpret_line(
        self, hexagram_number: int, line_number: int, line_text: str
    ) -> str:
        try:
            prompt = f"""
            Interpret line {line_number} of hexagram {hexagram_number}:
            "{line_text}"
            """
            return await self.genai_client.generate_content(prompt)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error interpreting line: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to interpret line: {str(e)}",
            )


class ChatService:
    def __init__(self, genai_client: GenAIClient):
        self.genai_client = genai_client

    async def process_message(self, message: Message) -> str:
        return await self.genai_client.generate_content(message.content)


# FastAPI app setup
app = FastAPI(title="I Ching API")

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
    interpretation_service: InterpretationService = Depends(get_interpretation_service),
):
    if request.mode not in VALID_DIVINATION_MODES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid mode. Must be one of: {VALID_DIVINATION_MODES}",
        )
    try:
        reading = await reading_service.generate_reading(request.mode)
        interpretation = await reading_service.interpret_reading(reading)
        # Fix deprecated dict() usage
        return {
            "success": True,
            "data": {**reading.model_dump(), "interpretation": interpretation},
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Reading generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/hexagrams/{number}", response_model=HexagramData)
def get_hexagram(number: int):
    hexagram_service = HexagramService()
    try:
        return hexagram_service.hexagrams[number]
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Hexagram {number} not found"
        )


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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hexagram {request.hexagram_number} not found",
        )
    except Exception as e:
        logger.error(f"Error interpreting hexagram: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


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
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing hexagram_number or line_number",
            )

        hexagram = hexagram_service.hexagrams.get(hexagram_number)
        if not hexagram:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hexagram {hexagram_number} not found",
            )

        if not hexagram.lines or not 1 <= line_number <= len(hexagram.lines):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid line number: {line_number}",
            )

        line = hexagram.lines[line_number - 1]
        interpretation = await interpretation_service.interpret_line(
            hexagram_number, line_number, line
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


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
            ] = await interpretation_service.interpret_line(line)

        return {
            "basic": basic_interpretation,
            "changingLines": changing_line_interpretations,
        }
    except Exception as e:
        logger.error(f"Error interpreting comprehensive reading: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@app.post("/chat/enhanced", response_model=Dict[str, Any])
async def enhanced_interpretation(
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hexagram {request.hexagram_number} not found",
        )
    except Exception as e:
        logger.error(f"Error in enhanced interpretation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
