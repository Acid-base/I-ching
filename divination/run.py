#!/usr/bin/env python3
"""
Run script for I Ching API
Starts the FastAPI server with uvicorn
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
