"""FastAPI implementation for I Ching divination."""

import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

import google.generativeai as genai
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from core import coins, yarrow
from models.schemas import DivinationMethod, HexagramData, ReadingRequest, ReadingResponse

# Load environment variables from .env file
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    print(f"Loading environment variables from {env_path}")
    load_dotenv(env_path)
else:
    print(f"No .env file found at {env_path}, using environment variables from system")

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(
    title="I Ching API",
    description="API for I Ching divination using yarrow stalks or three coins method",
    version="0.1.0",
)

# Configure CORS
allowed_origins = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=[],
    max_age=600,
)

# Load hexagram data from JSON file
with open(Path(__file__).parent / "data/hexagrams.json", "r") as f:
    hexagrams_data = json.load(f)

# In-memory chat history (for simplicity)
chat_sessions: Dict[str, List[Dict[str, str]]] = {}


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


@app.get("/hexagrams/{hexagram_id}", response_model=HexagramData)
async def get_hexagram(hexagram_id: int) -> JSONResponse:
    """Get a single hexagram by its number."""
    if hexagram_id < 1 or hexagram_id > 64:
        raise HTTPException(status_code=404, detail="Hexagram not found")

    hexagram = hexagrams_data.get(str(hexagram_id))
    if not hexagram:
        raise HTTPException(status_code=404, detail="Hexagram not found")

    return JSONResponse(content=hexagram)


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
                content={"detail": (f"Invalid divination method: {request.mode}. Must be 'yarrow' or 'coins'")},
            )

        if not reading:
            return JSONResponse(status_code=500, content={"detail": "Invalid reading result format"})

        if "error" in reading:
            return JSONResponse(status_code=500, content={"detail": str(reading["error"])})

        cast_result = reading.get("cast_result")
        if not cast_result:
            return JSONResponse(status_code=500, content={"detail": "No cast result in reading"})

        # The rest of the logic to format the response
        primary_hexagram_num = cast_result["primary_hexagram_number"]
        primary_hexagram_data = hexagrams_data.get(str(primary_hexagram_num))

        response_data = {
            "hexagram_number": primary_hexagram_num,
            "changing_lines": cast_result.get("changing_line_indices", []),
            "lines": [str(line) for line in cast_result["lines"]],
            "reading": primary_hexagram_data,
        }

        if "transformed_hexagram_number" in cast_result:
            transformed_hexagram_num = cast_result["transformed_hexagram_number"]
            transformed_hexagram_data = hexagrams_data.get(str(transformed_hexagram_num))
            response_data["relating_hexagram"] = transformed_hexagram_data
        else:
            response_data["relating_hexagram"] = None

        return JSONResponse(content=response_data)

    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": f"Internal server error: {str(e)}"})


# AI Interpretation endpoints
class InterpretationRequest(BaseModel):
    hexagram_number: int


class InterpretationResponse(BaseModel):
    interpretation: str
    reading_summary: str


@app.post("/interpretations/hexagram", response_model=InterpretationResponse)
async def interpret_hexagram_endpoint(request: InterpretationRequest):
    """Generate an AI interpretation of the reading"""
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    model = genai.GenerativeModel("gemini-1.5-flash")
    hexagram = hexagrams_data.get(str(request.hexagram_number))
    if not hexagram:
        raise HTTPException(status_code=404, detail="Hexagram not found")

    prompt = f"Provide a simple interpretation of the I Ching hexagram: {hexagram['name']}."
    response = await model.generate_content_async(prompt)
    return InterpretationResponse(
        interpretation=response.text,
        reading_summary=f"Interpretation for {hexagram['name']}",
    )


@app.post("/interpretations/comprehensive", response_model=InterpretationResponse)
async def get_enhanced_interpretation(request: InterpretationRequest):
    """Generate a comprehensive AI interpretation of the reading"""
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    model = genai.GenerativeModel("gemini-1.5-flash")
    hexagram = hexagrams_data.get(str(request.hexagram_number))
    if not hexagram:
        raise HTTPException(status_code=404, detail="Hexagram not found")

    prompt = f"Provide a comprehensive interpretation of the I Ching hexagram: {hexagram['name']}. Include details on the judgment, image, and each line."
    response = await model.generate_content_async(prompt)
    return InterpretationResponse(
        interpretation=response.text,
        reading_summary=f"Comprehensive interpretation for {hexagram['name']}",
    )


# Chat endpoints
class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    success: bool
    data: Dict[str, Any]


@app.post("/chat/start", response_model=ChatResponse)
async def start_chat():
    """Start a new chat session."""
    session_id = os.urandom(16).hex()
    chat_sessions[session_id] = []
    return ChatResponse(success=True, data={"session_id": session_id})


@app.post("/chat/message", response_model=ChatResponse)
async def send_chat_message(request: ChatRequest):
    """Send a message in the chat session."""
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    session_id = request.session_id
    if session_id not in chat_sessions:
        raise HTTPException(status_code=404, detail="Chat session not found")

    model = genai.GenerativeModel("gemini-1.5-flash")
    chat = model.start_chat(history=chat_sessions[session_id])
    response = await chat.send_message_async(request.message)

    chat_sessions[session_id].append({"role": "user", "parts": [request.message]})
    chat_sessions[session_id].append({"role": "model", "parts": [response.text]})

    return ChatResponse(success=True, data={"message": response.text})


# Run the application with uvicorn if executed directly
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
