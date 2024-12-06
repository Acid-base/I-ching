from typing import TypedDict, Optional, List, cast
from fastapi import APIRouter, Depends, HTTPException
from pathlib import Path
import json

from ..core.hexagram import Hexagram, HexagramReading
from ..core.interpreter import ReadingInterpreter

router = APIRouter()

class RelatingHexagramResponse(TypedDict):
    number: int
    name: str
    chinese: str
    description: str

class ReadingResponse(TypedDict):
    hexagram_number: int
    changing_lines: List[int]
    lines: List[int]
    reading: HexagramReading
    relating_hexagram: Optional[RelatingHexagramResponse]

async def get_reading_interpreter() -> ReadingInterpreter:
    readings_file = Path("data/readings.json")
    try:
        with readings_file.open("r", encoding="utf-8") as f:
            readings = json.load(f)
        return ReadingInterpreter(readings)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Readings file not found.")

@router.post("/reading")
async def get_reading(interpreter: ReadingInterpreter = Depends(get_reading_interpreter)) -> ReadingResponse:
    hexagram = Hexagram()
    hexagram.generate()

    assert hexagram.number is not None

    try:
        primary_reading = interpreter.get_reading(hexagram.number, hexagram.changing_lines)
        relating_hexagram = hexagram.get_relating_hexagram()
        relating_hexagram_reading: Optional[RelatingHexagramResponse] = None

        if relating_hexagram and relating_hexagram.number is not None:
            relating_hexagram_reading_full = interpreter.get_reading(relating_hexagram.number)
            relating_hexagram_reading = cast(RelatingHexagramResponse, {
                "number": relating_hexagram.number,
                "name": relating_hexagram_reading_full["name"],
                "chinese": relating_hexagram_reading_full["chinese"],
                "description": relating_hexagram_reading_full["description"],
            })

        return cast(ReadingResponse, {
            "hexagram_number": hexagram.number,
            "changing_lines": hexagram.changing_lines,
            "lines": hexagram.lines,
            "reading": primary_reading,
            "relating_hexagram": relating_hexagram_reading,
        })

    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e)) 