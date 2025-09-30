from fastapi import APIRouter
from fastapi.responses import JSONResponse
from app.services.health_service import ServerHealth

router = APIRouter()
health_service = ServerHealth() #! call class

@router.get("/health_check", tags=["Health"])
def health_check():
    data, status_code = health_service.health_check_status()
    return JSONResponse(content=data, status_code=status_code)
