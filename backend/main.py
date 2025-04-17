"""FastAPI implementation for I Ching divination."""

import os
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core import coins, yarrow
from models.schemas import DivinationMethod, ReadingRequest, ReadingResponse

app = FastAPI(
    title="I Ching API",
    description="API for I Ching divination using yarrow stalks or three coins method",
    version="0.1.0",
)

# Configure CORS
allowed_origins = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=[],
    max_age=600,
)


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
                        f"Invalid divination method: {request.mode}. "
                        "Must be 'yarrow' or 'coins'"
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
