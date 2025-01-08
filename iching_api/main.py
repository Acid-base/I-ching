from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from iching_api.app.api import endpoints
from iching_api.core.client import GenAIClient
from iching_api.core.config import settings

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    app.genai_client = GenAIClient(api_key=settings.gemini_api_key)


app.include_router(endpoints.router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
