import logging
from typing import List, Optional

from fastapi import HTTPException, status
import google.generativeai as genai_lib
from pydantic import BaseModel
from tenacity import retry, stop_after_attempt, wait_exponential

from .models import IChingReading
from ..config import Config

logger = logging.getLogger(__name__)

class GeminiGenerateContentRequest(BaseModel):
    contents: List[dict]
    tools: Optional[List[dict]] = None
    generationConfig: Optional[dict]] = None
    safetySettings: Optional[List[dict]] = None
    responseMimeType: Optional[str] = None

class GenAIClient:
    def __init__(self):
        self.api_key = Config.load_api_key()
        genai_lib.configure(api_key=self.api_key)
        self.model = genai_lib.GenerativeModel("gemini-pro")
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
    async def generate_content(
        self, request: GeminiGenerateContentRequest
    ) -> IChingReading:
        try:
            # Generate the response schema, which is the IChingReading object
            response_schema = IChingReading.schema_json()

            # Set the response MIME type to application/json and include the response schema in the prompt
            if (
                request.responseMimeType is None
                or request.responseMimeType == "application/json"
            ):
                prompt = f"Please generate a response in JSON format. Use the following JSON schema: {response_schema}"
                if len(request.contents) == 1 and "parts" in request.contents[0]:
                    request.contents[0]["parts"].insert(0, {"text": prompt})
                else:
                    request.contents.insert(0, {"parts": [{"text": prompt}]})

            # Generate content using the Gemini API
            response = self.model.generate_content(
                request.contents,
                tools=request.tools,
                generation_config=request.generationConfig,
                safety_settings=request.safetySettings,
                response_mime_type=request.responseMimeType,
            )

            # Check for errors
            if response.prompt_feedback and response.prompt_feedback.block_reason:
                raise HTTPException(
                    status_code=400,
                    detail=f"Blocked for: {response.prompt_feedback.block_reason}",
                )
            if response.text:
                raise HTTPException(
                    status_code=400,
                    detail=f"The response text was: {response.text}, and it did not generate any JSON that could be parsed according to the schema.",
                )

            # Extract JSON from the response
            if len(response.candidates) == 0:
                raise HTTPException(
                    status_code=400, detail="No candidates in the response"
                )
            candidate = response.candidates[0]
            if "parts" not in candidate.content:
                raise HTTPException(
                    status_code=400,
                    detail=f"No parts in the candidate content: {candidate.content}",
                )
            part = candidate.content["parts"][0]
            if "text" not in part:
                raise HTTPException(
                    status_code=400, detail=f"No text in the content part: {part}"
                )
            json_string = part["text"]

            # Parse the extracted JSON string into an IChingReading object
            try:
                iching_data = IChingReading.parse_raw(json_string)
                return iching_data
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid JSON Response: {e} text = {json_string}",
                )

        except Exception as e:
            logger.error(f"Error generating content: {e}")
            if "quota" in str(e).lower() or "429" in str(e):
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Please try again later.",
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
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
