"""FastAPI implementation for I Ching divination."""

import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from core.yarrow import get_reading
from models.schemas import ReadingRequest, ReadingResponse

app = FastAPI(
    title="I Ching API", description="API for I Ching divination using the yarrow stalk method", version="0.1.0"
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
        "description": "I Ching divination using the yarrow stalk method",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy"}


@app.post("/cast", response_model=ReadingResponse)
async def cast_hexagram(request: ReadingRequest):
    """Generate an I Ching reading using the specified method."""
    try:
        result = get_reading(mode=request.mode, seed=request.seed, verbose=request.verbose, print_result=False)

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


def main():
    """Entry point for running the API server."""
    import uvicorn

    # Run uvicorn directly
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port)


if __name__ == "__main__":
    main()
