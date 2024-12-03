from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List

from .core import Hexagram
from .interpreter import ReadingInterpreter

app = FastAPI(title="I Ching Divination")

# Serve static files
app.mount("/static", StaticFiles(directory="iching/static"), name="static")

class ReadingResponse(BaseModel):
    hexagram_number: int
    changing_lines: List[int]
    lines: List[int]
    reading: str
    
    class Config:
        frozen = True

@app.get("/")
async def read_root() -> FileResponse:
    return FileResponse("iching/static/index.html")

@app.post("/reading", response_model=ReadingResponse)
async def get_reading() -> ReadingResponse:
    hexagram = Hexagram()
    hexagram.generate()
    
    interpreter = ReadingInterpreter()
    reading = interpreter.get_reading(
        hexagram.number,
        hexagram.changing_lines
    )
    
    assert hexagram.number is not None
    
    return ReadingResponse(
        hexagram_number=hexagram.number,
        changing_lines=hexagram.changing_lines,
        lines=hexagram.lines,
        reading=reading
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 