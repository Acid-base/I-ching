"""Pydantic models for I Ching API."""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class ReadingRequest(BaseModel):
    """Request model for generating a reading."""

    mode: str = "yarrow"
    seed: Optional[int] = None
    verbose: bool = False


class ReadingResponse(BaseModel):
    """Response model for a reading."""

    hexagram_number: int
    changing_lines: List[int]
    lines: List[str]
    reading: Dict[str, Any]
    relating_hexagram: Optional[Dict[str, Any]] = None
