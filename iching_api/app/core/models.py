from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class Line(BaseModel):
    lineNumber: int
    type: str
    isChanging: bool
    meaning: str

class PrimaryHexagram(BaseModel):
    number: int
    name: str
    judgment: str
    image: str
    lines: List[Line]
    upperTrigram: str
    lowerTrigram: str

class RelatingHexagram(BaseModel):
    number: int
    name: str
    chineseName: str
    judgment: str

class ReadingMetadata(BaseModel):
    date: datetime
    method: str

class IChingReading(BaseModel):
    readingMetadata: ReadingMetadata
    primaryHexagram: PrimaryHexagram
    relatingHexagram: Optional[RelatingHexagram] = None

class Interpretation(BaseModel):
    interpretation: str
    summary: str
