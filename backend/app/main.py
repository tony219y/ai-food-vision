from fastapi import FastAPI

from app.routes import handleHealth, analysis


app = FastAPI()

app.include_router(handleHealth.router, prefix="/api/v1", tags=["Health"])
app.include_router(analysis.router, prefix="/api/v1", tags=["analysis"])