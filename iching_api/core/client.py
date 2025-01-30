import asyncio
from typing import Dict, Optional

import google.generativeai as genai_lib
from tenacity import retry, stop_after_attempt, wait_exponential

from iching_api.core.config import config

class GenAIClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or config.load_api_key()
        genai_lib.configure(api_key=self.api_key)
        self.model = genai_lib.GenerativeModel("gemini-pro")
        self.prompts = self._load_prompts()
        self._setup_retry_config()
        self._lock = asyncio.Lock()

    def _setup_retry_config(self):
        self.max_retries = config.MAX_RETRIES
        self.initial_retry_delay = 2
        self.max_retry_delay = 60

    def _load_prompts(self) -> Dict[str, str]:
        try:
            return config.load_prompts()
        except Exception:
            return {
                "system_prompt": config.DEFAULT_SYSTEM_PROMPT,
                "enhanced_prompt": "You are a master I Ching scholar and interpreter...",
                "chat_prompt": "You are an expert I Ching consultant...",
            }

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=2, min=4, max=60),
        reraise=True,
    )
    async def generate_content(self, request):
        async with self._lock:
            # Implementation details from original file...
            pass
