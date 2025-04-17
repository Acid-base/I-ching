"""Pydantic models for I Ching API."""

from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, validator


class DivinationMethod(str, Enum):
    """Valid divination methods."""

    YARROW = "yarrow"
    COINS = "coins"
    COIN = "coin"  # Adding singular form for frontend compatibility


class ReadingRequest(BaseModel):
    """Request model for generating a reading."""

    mode: DivinationMethod
    seed: Optional[int] = None
    verbose: Optional[bool] = False

    @validator("mode", pre=True)
    def normalize_mode(cls, v):
        if v == "coin":
            return "coins"
        return v


class ReadingResponse(BaseModel):
    """Response model for a reading."""

    hexagram_number: int
    changing_lines: list[int] = []
    lines: list[str]
    reading: dict[str, Any]
    relating_hexagram: dict[str, Any] | None = None

    class Config:
        json_schema_extra = {
            "example": {
                "hexagram_number": 1,
                "changing_lines": [2, 3],
                "lines": ["7", "6", "9", "7", "7", "7"],
                "reading": {
                    "number": 1,
                    "name": "Force (Ch'ien)",
                    "judgment": "The creative works sublime success...",
                    "image": "The movement of heaven is full of power...",
                },
                "relating_hexagram": None,
            }
        }
