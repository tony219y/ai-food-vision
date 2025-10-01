from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import handleHealth, analysis


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","https://ai-food-vision.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(handleHealth.router, prefix="/api/v1", tags=["Health"])
app.include_router(analysis.router, prefix="/api/v1", tags=["analysis"])
