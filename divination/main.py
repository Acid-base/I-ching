"""FastAPI implementation for I Ching divination."""

import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from core import coins, yarrow
from models.schemas import DivinationMethod, ReadingRequest, ReadingResponse

app = FastAPI(
    title="I Ching API",
    description="API for I Ching divination using yarrow stalks or three coins method",
    version="0.1.0",
)

# Configure CORS
# Get allowed origins from environment variable or use default for development
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
print(f"Allowed CORS origins: {allowed_origins}")

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Use configured origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


@app.get("/")
async def root():
    """Root endpoint returning API information."""
    return {
        "name": "I Ching API",
        "version": "0.1.0",
        "description": "I Ching divination using yarrow stalks or three coins method",
        "methods": ["yarrow", "coins"],
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy"}


@app.post("/cast", response_model=ReadingResponse)
async def cast_hexagram(request: ReadingRequest):
    """Generate an I Ching reading using the specified method."""
    try:
        # Choose the divination method based on request
        if request.mode == DivinationMethod.YARROW:
            reading = yarrow.get_reading(
                mode=request.mode.value,
                seed=request.seed,
                verbose=request.verbose,
            )
        elif request.mode == DivinationMethod.COINS:
            reading = coins.get_reading(
                mode=request.mode.value,
                seed=request.seed,
                verbose=request.verbose,
            )
        else:
            raise HTTPException(
                status_code=400, detail=f"Invalid divination method: {request.mode}"
            )

        if "error" in reading:
            raise HTTPException(status_code=500, detail=reading["error"])

        # Format response according to schema
        cast_result = reading["cast_result"]
        lines = [str(line) for line in cast_result["lines"]]

        response = {
            "hexagram_number": cast_result["primary_hexagram_number"],
            "changing_lines": cast_result["changing_line_indices"],
            "lines": lines,
            "reading": reading["primary_hexagram"],
        }

        # Add relating hexagram if there are changing lines
        if "transformed_hexagram" in reading:
            response["relating_hexagram"] = reading["transformed_hexagram"]

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def main():
    """Entry point for running the API server."""
    import uvicorn

    # Run uvicorn directly
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port)


if __name__ == "__main__":
    main()
