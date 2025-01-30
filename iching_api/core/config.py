import json
import os
from pathlib import Path

from pydantic import BaseModel

# Simple implementation without version checking
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str = ""
    api_base_url: str = "http://localhost:8000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "allow"


class Config(BaseModel):
    API_KEY_FILE: str = "api_key.txt"
    PROMPTS_FILE: Path = (
        Path(__file__).resolve().parent.parent / "data" / "prompts.json"
    )
    HEXAGRAMS_FILE: Path = (
        Path(__file__).resolve().parent.parent / "data" / "hexagrams.json"
    )
    DEFAULT_SYSTEM_PROMPT: str = "You are a master I Ching scholar and diviner..."
    DEFAULT_TIMEOUT: int = 30
    MAX_RETRIES: int = 3
    MAX_TOKENS: int = 1000
    RATE_LIMIT: int = 10

    @classmethod
    def load_api_key(cls) -> str:
        if os.path.exists(cls.API_KEY_FILE):
            with open(cls.API_KEY_FILE) as file:
                return file.read().strip()
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            api_key = input("Enter your Gemini API key: ")
        with open(cls.API_KEY_FILE, "w") as file:
            file.write(api_key)
        return api_key

    @classmethod
    def load_prompts(cls) -> dict:
        if not os.path.exists(cls.PROMPTS_FILE):
            return {"system_prompt": cls.DEFAULT_SYSTEM_PROMPT}
        with open(cls.PROMPTS_FILE, encoding="utf-8") as f:
            return json.load(f)


settings = Settings()
config = Config()

# For backward compatibility
Config = config
