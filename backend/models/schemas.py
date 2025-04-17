"""Pydantic schemas for the I Ching API."""

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class DivinationMethod(str, Enum):
    """Divination methods supported by the API."""

    YARROW = "yarrow"
    COINS = "coins"
    COIN = "coin"  # For compatibility


class ReadingRequest(BaseModel):
    """Request model for generating I Ching readings."""

    mode: DivinationMethod = Field(
        default=DivinationMethod.YARROW, description="Divination method to use"
    )
    seed: Optional[int] = Field(default=None, description="Random seed for reproducible readings")
    verbose: Optional[bool] = Field(default=False, description="Include detailed output")


class TrigamInfo(BaseModel):
    """Information about a trigram."""

    name: str
    value: int


class Trigrams(BaseModel):
    """Pair of trigrams that make up a hexagram."""

    upper: TrigamInfo
    lower: TrigamInfo


class LineData(BaseModel):
    """Data for a single line in a hexagram."""

    lineNumber: int
    meaning: str


class HexagramData(BaseModel):
    """Complete hexagram data."""

    number: int
    name: str
    chineseName: Optional[str] = None
    judgment: str
    image: str
    trigrams: Optional[Trigrams] = None
    lines: List[LineData] = []


class ReadingResponse(BaseModel):
    """Response model for I Ching readings."""

    hexagram_number: int
    changing_lines: List[int] = []
    lines: List[str]
    reading: HexagramData
    relating_hexagram: Optional[HexagramData] = None
