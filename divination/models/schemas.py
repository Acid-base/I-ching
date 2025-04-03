"""Pydantic models for I Ching API."""

from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class DivinationMethod(str, Enum):
    """Valid divination methods."""

    YARROW = "yarrow"
    COINS = "coins"


class ReadingRequest(BaseModel):
    """Request model for generating a reading."""

    mode: DivinationMethod = Field(
        default=DivinationMethod.YARROW, description="Divination method to use"
    )
    seed: Optional[int] = Field(
        default=None, description="Optional seed for reproducible readings"
    )
    verbose: bool = Field(
        default=False, description="Whether to include detailed output"
    )


class ReadingResponse(BaseModel):
    """Response model for a reading."""

    hexagram_number: int
    changing_lines: List[int]
    lines: List[str]
    reading: Dict[str, Any]
    relating_hexagram: Optional[Dict[str, Any]] = None
