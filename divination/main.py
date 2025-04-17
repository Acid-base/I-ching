"""I Ching divination API."""

import json
import os
import random
import sys
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

# Add the project root to the Python path for direct script execution
root_dir = str(Path(__file__).parent.parent)
if root_dir not in sys.path:
    sys.path.append(root_dir)

import uvicorn
from fastapi import Body, FastAPI, HTTPException
from fastapi import Path as PathParam
from fastapi.middleware.cors import CORSMiddleware

# Now import the local modules - use relative imports when running from within divination directory
try:
    # Try absolute imports first (when installed as a package)
    from divination.core.yarrow import YarrowStalkMethod
    from divination.models.schemas import (
        Hexagram,
        HexagramLine,
        Reading,
        ReadingRequest,
        ReadingResponse,
    )
except ImportError:
    # Fall back to relative imports (when running script directly)
    from core.yarrow import YarrowStalkMethod
    from models.schemas import (
        Hexagram,
        HexagramLine,
        Reading,
        ReadingRequest,
        ReadingResponse,
    )

app = FastAPI(
    title="I Ching Divination API",
    description="API for generating and interpreting I Ching readings",
    version="0.1.0",
)

# Configure CORS
# Get allowed origins from environment variable or use default for development
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_API_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
)

# In-memory storage for readings (would use a database in production)
readings_db: Dict[str, Reading] = {}


@app.get("/")
async def root() -> Dict[str, str]:
    """Root endpoint returning API information."""
    return {
        "name": "I Ching API",
        "version": "0.1.0",
        "description": "I Ching divination using the yarrow stalk method",
    }


@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint for monitoring."""
    return {"status": "healthy"}


def perform_divination(
    mode: str = "yarrow_stalks",
    seed: Optional[int] = None,
    verbose: bool = False,
    print_result: bool = False,
) -> Dict[str, Any]:
    """Generate an I Ching reading using the specified method.

    Args:
        mode: Divination method to use (yarrow_stalks, coins, etc.)
        seed: Optional random seed for reproducibility
        verbose: Whether to include detailed information
        print_result: Whether to print the result to console

    Returns:
        Dictionary containing the reading results
    """
    # Initialize randomness
    if seed is not None:
        random.seed(seed)

    # Initialize yarrow stalks divination
    yarrow = YarrowStalkMethod(seed=seed)

    # Generate the hexagram
    lines = yarrow.generate_hexagram()

    # Identify changing lines (6 and 9 are changing)
    changing_line_indices = [i for i, line in enumerate(lines) if line in (6, 9)]

    # For demonstration purposes - would actually look up hexagram by pattern
    primary_hexagram_number = random.randint(1, 64)

    result = {
        "cast_result": {
            "lines": lines,
            "primary_hexagram_number": primary_hexagram_number,
            "changing_line_indices": changing_line_indices,
        },
        "primary_hexagram": {
            "number": primary_hexagram_number,
            "name": f"Hexagram {primary_hexagram_number}",
            "description": "Hexagram description would go here",
        },
    }

    # Add transformed hexagram if there are changing lines
    if changing_line_indices:
        result["transformed_hexagram"] = {
            "number": random.randint(1, 64),
            "name": "Transformed Hexagram",
            "description": "Transformed hexagram description",
        }

    if print_result:
        print(json.dumps(result, indent=2))

    return result


@app.post("/cast", response_model=ReadingResponse)
async def cast_hexagram(request: ReadingRequest) -> ReadingResponse:
    """Generate an I Ching reading using the specified method."""
    try:
        # Use the newly defined perform_divination function
        result = perform_divination(
            mode=request.mode,
            seed=request.seed,
            verbose=request.verbose,
            print_result=False,
        )

        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])

        # Format response according to API schema
        return {
            "hexagram_number": result["cast_result"]["primary_hexagram_number"],
            "changing_lines": [i + 1 for i in result["cast_result"]["changing_line_indices"]],
            "lines": [str(line) for line in result["cast_result"]["lines"]],
            "reading": result["primary_hexagram"],
            "relating_hexagram": result.get("transformed_hexagram"),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/readings", response_model=Reading)
async def create_reading(
    question: Optional[str] = Body(None, description="Question for the divination"),
    method: str = Body(
        ..., description="Method used for divination (coins, yarrow_stalks, manual)"
    ),
) -> Reading:
    """Create a new I Ching reading."""
    # In a real implementation, we would generate the hexagram based on the method
    # For demo purposes, we're creating a predefined hexagram

    # Generate a unique ID
    reading_id = str(uuid.uuid4())

    # Create a sample hexagram
    hexagram = Hexagram(
        number=1,
        name="The Creative (Qian)",
        lines=[
            HexagramLine.YANG,
            HexagramLine.YANG,
            HexagramLine.YANG,
            HexagramLine.YANG,
            HexagramLine.YANG,
            HexagramLine.YANG,
        ],
        related_hexagram=None,
    )

    # Create the reading
    reading = Reading(
        id=reading_id,
        timestamp=datetime.now(),
        hexagram=hexagram,
        question=question,
        interpretation="The Creative represents pure yang energy, suggesting strength, creativity, and leadership.",
    )

    # Store the reading
    readings_db[reading_id] = reading

    return reading


@app.get("/readings/{reading_id}", response_model=Reading)
async def get_reading(
    reading_id: str = PathParam(..., description="The ID of the reading to retrieve"),
) -> Reading:
    """Retrieve a specific I Ching reading."""
    if reading_id not in readings_db:
        raise HTTPException(status_code=404, detail="Reading not found")

    return readings_db[reading_id]


@app.get("/readings", response_model=List[Reading])
async def list_all_readings() -> List[Reading]:
    """List all I Ching readings."""
    return list(readings_db.values())


def main() -> None:
    """Entry point for running the API server."""
    # Run uvicorn directly
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port)


if __name__ == "__main__":
    main()
