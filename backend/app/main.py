from fastapi import FastAPI

from app.routes import handleHealth as v1


app = FastAPI()

app.include_router(v1.router, prefix="/api/v1", tags=["Health"])
