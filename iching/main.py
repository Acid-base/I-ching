from typing import List, Dict, Union, Optional, TypedDict
from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import json
from .core import Hexagram, ReadingInterpreter, HexagramReading

app = FastAPI(title="I Ching Divination")

# Serve static files
app.mount("/static", StaticFiles(directory="iching/static"), name="static")

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
    readings_file = Path("iching/data/readings.json")
    try:
        with readings_file.open("r", encoding="utf-8") as f:
            readings = json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Readings file not found.")
    return ReadingInterpreter(readings)

@app.get("/")
async def read_root() -> FileResponse:
    return FileResponse("iching/static/index.html")

@app.post("/reading")
async def get_reading(interpreter: ReadingInterpreter = Depends(get_reading_interpreter)) -> ReadingResponse:
    hexagram = Hexagram()
    hexagram.generate()

    assert hexagram.number is not None

    try:
        primary_reading = interpreter.get_reading(hexagram.number, hexagram.changing_lines)
        relating_hexagram = hexagram.get_relating_hexagram()
        relating_hexagram_reading = None

        if relating_hexagram and relating_hexagram.number is not None:
            relating_hexagram_reading_full = interpreter.get_reading(relating_hexagram.number)
            relating_hexagram_reading = {
                "number": relating_hexagram.number,
                "name": relating_hexagram_reading_full["name"],
                "chinese": relating_hexagram_reading_full["chinese"],
                "description": relating_hexagram_reading_full["description"],
            }

        return {
            "hexagram_number": hexagram.number,
            "changing_lines": hexagram.changing_lines,
            "lines": hexagram.lines,
            "reading": primary_reading,
            "relating_hexagram": relating_hexagram_reading,
        }

    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 