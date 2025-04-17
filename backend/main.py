"""FastAPI implementation for I Ching divination."""

import os
import random
from typing import Any, Dict, List, Optional, cast

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from core import coins, yarrow
from models.schemas import DivinationMethod, HexagramData, ReadingRequest, ReadingResponse

app = FastAPI(
    title="I Ching API",
    description="API for I Ching divination using yarrow stalks or three coins method",
    version="0.1.0",
)

# Configure CORS
allowed_origins = os.getenv("CORS_ORIGINS", "*").split(",")

# Fixing CORS configuration to use allowed_origins from environment variables
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=[],
    max_age=600,
)


# Simple I-Ching data model (expanded version would be in separate files)
class Line(BaseModel):
    number: int
    value: str  # 6, 7, 8, or 9
    meaning: Optional[str] = None


class HexagramReading(BaseModel):
    number: int
    name: str
    chinese: str
    judgment: str
    image: str
    lines: List[Dict[str, str]] = []


class RelatingHexagram(BaseModel):
    number: int
    name: str
    judgment: str
    image: str


# Basic hexagram database - in production, use a proper database
hexagrams = {
    1: {
        "name": "The Creative",
        "chinese": "乾 (Qián)",
        "judgment": "The Creative works sublime success, furthering through perseverance.",
        "image": "The movement of heaven is full of power. Thus the superior person makes himself strong and untiring.",
    },
    2: {
        "name": "The Receptive",
        "chinese": "坤 (Kūn)",
        "judgment": "The Receptive brings about sublime success, furthering through the perseverance of a mare.",
        "image": "The earth's condition is receptive devotion. Thus the superior person who has breadth of character carries the outer world.",
    },
    # Add more hexagrams as needed
}


@app.get("/")
async def root() -> dict[str, Any]:
    """Root endpoint returning API information."""
    return {
        "name": "I Ching API",
        "version": "0.1.0",
        "description": "I Ching divination using yarrow stalks or three coins method",
        "methods": ["yarrow", "coins"],
    }


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint for monitoring."""
    return {"status": "healthy"}


@app.options("/cast")
async def cast_options() -> dict[str, str]:
    """Handle OPTIONS preflight request for the cast endpoint."""
    return {"detail": "OK"}


@app.post("/cast", response_model=ReadingResponse)
async def cast_hexagram(request: ReadingRequest) -> JSONResponse:
    """Generate an I Ching reading using the specified method."""
    try:
        # Ensure verbose has a boolean value
        verbose = bool(request.verbose) if request.verbose is not None else False

        if request.mode == DivinationMethod.YARROW:
            reading = yarrow.get_reading(
                seed=request.seed,
                verbose=verbose,
            )
        elif request.mode == DivinationMethod.COINS:
            reading = coins.get_reading(
                seed=request.seed,
                verbose=verbose,
            )
        else:
            return JSONResponse(
                status_code=400,
                content={
                    "detail": (
                        f"Invalid divination method: {request.mode}. Must be 'yarrow' or 'coins'"
                    )
                },
            )

        if not reading:
            return JSONResponse(
                status_code=500, content={"detail": "Invalid reading result format"}
            )

        if "error" in reading:
            return JSONResponse(status_code=500, content={"detail": str(reading["error"])})

        cast_result = reading.get("cast_result")
        if not cast_result:
            return JSONResponse(status_code=500, content={"detail": "No cast result in reading"})

        try:
            # Get trigram values and names
            lines = cast_result["lines"]
            lower_value = yarrow.get_trigram_value(lines[:3])
            upper_value = yarrow.get_trigram_value(lines[3:])
            lower_name = yarrow.get_trigram_name(lower_value)
            upper_name = yarrow.get_trigram_name(upper_value)

            # Add trigrams to the reading response
            if "primary_hexagram" not in reading:
                reading["primary_hexagram"] = {}

            reading["primary_hexagram"]["trigrams"] = {
                "upper": {"name": upper_name, "value": upper_value},
                "lower": {"name": lower_name, "value": lower_value},
            }

            response_data: dict[str, Any] = {
                "hexagram_number": cast_result["primary_hexagram_number"],
                "changing_lines": cast_result.get("changing_line_indices", []),
                "lines": [str(line) for line in cast_result["lines"]],
                "reading": reading["primary_hexagram"],
            }

            if "transformed_hexagram" in reading:
                # Also add trigrams for the transformed hexagram
                transformed_lines = yarrow.transform_lines(lines)
                trans_lower_value = yarrow.get_trigram_value(transformed_lines[:3])
                trans_upper_value = yarrow.get_trigram_value(transformed_lines[3:])
                if isinstance(reading["transformed_hexagram"], dict):
                    reading["transformed_hexagram"]["trigrams"] = {
                        "upper": {
                            "name": yarrow.get_trigram_name(trans_upper_value),
                            "value": trans_upper_value,
                        },
                        "lower": {
                            "name": yarrow.get_trigram_name(trans_lower_value),
                            "value": trans_lower_value,
                        },
                    }
                    response_data["relating_hexagram"] = reading["transformed_hexagram"]

            return JSONResponse(content=response_data)

        except Exception as e:
            return JSONResponse(
                status_code=500, content={"detail": f"Error formatting response: {str(e)}"}
            )

    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": f"Internal server error: {str(e)}"})


@app.post("/reading/generate", response_model=ReadingResponse)
async def generate_reading(request: ReadingRequest) -> JSONResponse:
    """Generate an I Ching reading using the specified method.
    This endpoint is an alias for /cast for compatibility with the frontend.
    """
    try:
        print(f"Reading generate request received: mode={request.mode}, seed={request.seed}")

        # Normalize coin/coins to COINS if needed
        if request.mode in [DivinationMethod.COIN, DivinationMethod.COINS]:
            request.mode = DivinationMethod.COINS
        elif request.mode != DivinationMethod.YARROW:
            return JSONResponse(
                status_code=400,
                content={
                    "detail": (
                        f"Invalid divination method: {request.mode}. "
                        "Must be 'yarrow' or 'coins' or 'coin'"
                    )
                },
            )

        # Pass the normalized request directly to cast_hexagram
        return await cast_hexagram(request)
    except Exception as e:
        print(f"Error in generate_reading: {e}")
        import traceback

        traceback.print_exc()
        return JSONResponse(
            status_code=500, content={"detail": f"Error in generate_reading: {str(e)}"}
        )


# Fix duplicate generate_reading function - rename it to avoid conflict
@app.post("/generate")
def create_simple_reading(method: Optional[str] = "coins"):
    """Generate a simplified I-Ching reading using either coins or yarrow stalks method"""
    if method not in ["coins", "yarrow"]:
        raise HTTPException(status_code=400, detail="Method must be either 'coins' or 'yarrow'")

    # Generate lines based on method
    lines = []
    for _ in range(6):
        if method == "yarrow":
            # Approximating yarrow probabilities
            rand = random.random()
            if rand < 0.0625:
                lines.append("6")  # Old Yin (changing)
            elif rand < 0.5:
                lines.append("8")  # Young Yin
            elif rand < 0.8125:
                lines.append("7")  # Young Yang
            else:
                lines.append("9")  # Old Yang (changing)
        else:  # coins method
            # Simplified coin probabilities (equal distribution)
            rand = random.random()
            if rand < 0.25:
                lines.append("6")  # Old Yin
            elif rand < 0.5:
                lines.append("8")  # Young Yin
            elif rand < 0.75:
                lines.append("7")  # Young Yang
            else:
                lines.append("9")  # Old Yang

    # Determine changing lines
    changing_lines = [i + 1 for i, line in enumerate(lines) if line in ["6", "9"]]

    # Determine primary hexagram number (simplified for demo)
    hexagram_number = random.randint(1, 64)

    # Get hexagram data or use placeholder
    hexagram_data = hexagrams.get(
        hexagram_number,
        {
            "name": f"Hexagram {hexagram_number}",
            "chinese": "易經",
            "judgment": "The judgment text for this hexagram.",
            "image": "The image text for this hexagram.",
        },
    )

    # Create reading
    reading = HexagramReading(
        number=hexagram_number,
        name=hexagram_data["name"],
        chinese=hexagram_data["chinese"],
        judgment=hexagram_data["judgment"],
        image=hexagram_data["image"],
        lines=[],
    )

    # Add relating hexagram if there are changing lines
    relating_hexagram = None
    if changing_lines:
        # In a real implementation, calculate the related hexagram
        # For this demo, just use a different random hexagram
        related_number = random.randint(1, 64)
        while related_number == hexagram_number:
            related_number = random.randint(1, 64)

        related_data = hexagrams.get(
            related_number,
            {
                "name": f"Hexagram {related_number}",
                "chinese": "易經",
                "judgment": "The judgment text for this hexagram.",
                "image": "The image text for this hexagram.",
            },
        )

        relating_hexagram = RelatingHexagram(
            number=related_number,
            name=related_data["name"],
            judgment=related_data["judgment"],
            image=related_data["image"],
        )

    # Convert HexagramReading to HexagramData for ReadingResponse
    reading_data = cast(
        HexagramData,
        {
            "number": reading.number,
            "name": reading.name,
            "chinese": reading.chinese,
            "judgment": reading.judgment,
            "image": reading.image,
        },
    )

    # Fix type error for relating_hexagram using type casting
    relating_data = None
    if relating_hexagram:
        relating_data = cast(
            HexagramData,
            {
                "number": relating_hexagram.number,
                "name": relating_hexagram.name,
                "judgment": relating_hexagram.judgment,
                "image": relating_hexagram.image,
            },
        )

    return ReadingResponse(
        hexagram_number=hexagram_number,
        changing_lines=changing_lines,
        lines=lines,
        reading=reading_data,
        relating_hexagram=relating_data,
    )


# AI Interpretation endpoint (simplified)
class InterpretationRequest(BaseModel):
    hexagram_number: int
    changing_lines: List[int] = []


class InterpretationResponse(BaseModel):
    interpretation: str
    reading_summary: str


@app.post("/interpret", response_model=InterpretationResponse)
def interpret_reading(request: InterpretationRequest):
    """Generate an AI interpretation of the reading"""
    # In a real implementation, this would call an LLM or other AI service
    hexagram_number = request.hexagram_number
    changing_lines = request.changing_lines

    # Get hexagram data or use placeholder
    hexagram_data = hexagrams.get(
        hexagram_number,
        {
            "name": f"Hexagram {hexagram_number}",
            "chinese": "易經",
            "judgment": "The judgment text for this hexagram.",
            "image": "The image text for this hexagram.",
        },
    )

    # Generate a placeholder interpretation
    interpretation = f"""
    Your I-Ching reading centers on {hexagram_data["name"]} (Hexagram {hexagram_number}).

    This hexagram suggests that you are at a point where {hexagram_data["judgment"]}

    The image of this hexagram tells us that: {hexagram_data["image"]}

    {"The changing lines in your reading indicate areas of transition and focus. " if changing_lines else ""}
    {"These changes suggest that you should pay particular attention to how you navigate the upcoming shifts in your situation." if changing_lines else "Your reading shows no changing lines, suggesting stability in your current situation."}
    """

    # Summary
    summary = f"Hexagram {hexagram_number}: {hexagram_data['name']} - {'With changing lines indicating transition' if changing_lines else 'A stable situation'}"

    return InterpretationResponse(interpretation=interpretation, reading_summary=summary)


# Run the application with uvicorn if executed directly
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
