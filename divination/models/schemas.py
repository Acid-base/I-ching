"""Schemas for the I Ching divination API."""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class HexagramLine(int, Enum):
    """Enum representing the types of lines in a hexagram."""

    # Broken/open line (yin)
    YIN = 0
    # Solid line (yang)
    YANG = 1
    # Changing yin to yang (old yin)
    CHANGING_YIN = 6
    # Changing yang to yin (old yang)
    CHANGING_YANG = 9


class Hexagram(BaseModel):
    """Model representing an I Ching hexagram."""

    number: int = Field(..., description="Hexagram number (1-64)")
    name: str = Field(..., description="Name of the hexagram")
    lines: List[int] = Field(
        ..., description="List of six lines (0=broken, 1=solid, 6=changing yin, 9=changing yang)"
    )
    related_hexagram: Optional["Hexagram"] = Field(
        None, description="Related hexagram after transformation"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "number": 1,
                "name": "The Creative (Qian)",
                "lines": [1, 1, 1, 1, 1, 1],
                "related_hexagram": None,
            }
        }
    }


class Reading(BaseModel):
    """Model representing a complete I Ching reading."""

    id: str = Field(..., description="Unique identifier for the reading")
    timestamp: datetime = Field(..., description="When the reading was performed")
    hexagram: Hexagram = Field(..., description="The primary hexagram")
    question: Optional[str] = Field(None, description="Question asked for the reading")
    interpretation: Optional[str] = Field(None, description="AI or traditional interpretation")

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "timestamp": "2023-09-01T12:34:56.789Z",
                "hexagram": {
                    "number": 1,
                    "name": "The Creative (Qian)",
                    "lines": [1, 1, 1, 1, 1, 1],
                    "related_hexagram": None,
                },
                "question": "What is the nature of my current situation?",
                "interpretation": "The Creative represents pure yang energy...",
            }
        }
    }


class ReadingRequest(BaseModel):
    """Model for requesting a new I Ching reading."""

    mode: str = Field(
        "yarrow_stalks", description="Divination method (yarrow_stalks, coins, probability)"
    )
    seed: Optional[int] = Field(None, description="Random seed for reproducibility")
    verbose: bool = Field(False, description="Whether to include detailed information")
    question: Optional[str] = Field(None, description="Question for the divination")


class ReadingResponse(BaseModel):
    """Model for the response from a reading generation."""

    hexagram_number: int = Field(..., description="Number of the primary hexagram")
    lines: List[str] = Field(..., description="List of six lines as strings")
    changing_lines: List[int] = Field(..., description="Indices of changing lines (1-indexed)")
    reading: Dict[str, Any] = Field(..., description="Primary hexagram details")
    relating_hexagram: Optional[Dict[str, Any]] = Field(
        None, description="Secondary hexagram if changes present"
    )
    interpretation: Optional[str] = Field(None, description="AI interpretation of the reading")
