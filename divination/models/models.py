from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class HexagramLine(Enum):
    """Represents a single line in a hexagram."""

    YIN = "yin"
    YANG = "yang"
    CHANGING_YIN = "changing_yin"
    CHANGING_YANG = "changing_yang"


class Hexagram(BaseModel):
    """Represents an I Ching hexagram."""

    number: int = Field(gt=0, le=64, description="The hexagram number (1-64)")
    name: str = Field(min_length=1, description="Traditional name of the hexagram")
    lines: List[HexagramLine] = Field(
        min_length=6, max_length=6, description="The six lines of the hexagram"
    )
    related_hexagram: Optional[int] = Field(
        None, gt=0, le=64, description="Related hexagram number after changes"
    )

    @field_validator("lines")
    @classmethod
    def validate_lines_length(cls, v: List[HexagramLine]) -> List[HexagramLine]:
        if len(v) != 6:
            raise ValueError("Hexagram must have exactly 6 lines")
        return v


class Reading(BaseModel):
    """Represents a complete I Ching reading."""

    id: str = Field(description="Unique identifier for the reading")
    timestamp: datetime = Field(
        default_factory=datetime.now, description="When the reading was performed"
    )
    hexagram: Hexagram
    question: Optional[str] = Field(None, description="The question asked during the divination")
    interpretation: Optional[str] = Field(None, description="Interpretation of the reading")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "reading_123",
                    "timestamp": "2023-06-15T14:30:00",
                    "hexagram": {
                        "number": 1,
                        "name": "The Creative",
                        "lines": ["YANG", "YANG", "YANG", "YANG", "YANG", "YANG"],
                        "related_hexagram": None,
                    },
                    "question": "What will be the outcome of my new project?",
                    "interpretation": "The Creative suggests powerful creative energy and success...",
                }
            ]
        }
    }
