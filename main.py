"""FastAPI implementation for I Ching divination."""
import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from core.yarrow import get_reading
from models.schemas import ReadingRequest, ReadingResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="I Ching API", 
    description="API for I Ching divination using the yarrow stalk method", 
    version="0.1.0"
)

# Configure CORS
# Get allowed origins from environment variable or use default for development
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
logger.info(f"Allowed CORS origins: {allowed_origins}")

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Use configured origins
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # More specific than ["*"]
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
async def root():
    """Root endpoint returning API information."""
    return {
        "name": "I Ching API",
        "version": "0.1.0",
        "description": "I Ching divination using the yarrow stalk method",
        "endpoints": {
            "health": "/health",
            "cast": "/cast"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "service": "I Ching API"}

@app.post("/cast", response_model=ReadingResponse)
async def cast_hexagram(request: ReadingRequest):
    """Generate an I Ching reading using the specified method."""
    try:
        logger.info(f"Casting hexagram with mode: {request.mode}, seed: {request.seed}")
        
        result = get_reading(
            mode=request.mode, 
            seed=request.seed, 
            verbose=request.verbose, 
            print_result=False
        )
        
        if "error" in result:
            logger.error(f"Error in get_reading: {result['error']}")
            raise HTTPException(status_code=500, detail=result["error"])
        
        # Format response according to API schema
        response = {
            "hexagram_number": result["cast_result"]["primary_hexagram_number"],
            "changing_lines": [i + 1 for i in result["cast_result"]["changing_line_indices"]],
            "lines": [str(line) for line in result["cast_result"]["lines"]],
            "reading": result["primary_hexagram"],
            "relating_hexagram": result.get("transformed_hexagram"),
        }
        
        logger.info(f"Successfully generated reading for hexagram {response['hexagram_number']}")
        return response
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error in cast_hexagram: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/methods")
async def get_methods():
    """Get available divination methods."""
    return {
        "methods": [
            {
                "name": "yarrow",
                "description": "Traditional yarrow stalk method"
            },
            {
                "name": "coins", 
                "description": "Three coin method"
            }
        ]
    }

def main():
    """Entry point for running the API server."""
    import uvicorn
    
    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    logger.info(f"Starting I Ching API server on {host}:{port}")
    
    # Run uvicorn directly
    uvicorn.run(
        "main:app", 
        host=host, 
        port=port, 
        reload=debug,
        log_level="info"
    )

if __name__ == "__main__":
    main()