from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import json, re

from app.services.image_service import getNutrition
router = APIRouter()

@router.post("/upload", tags=["analysis"])
async def upload(uploadInput: UploadFile | None = File(None)):
    
    # No image upload
    if uploadInput is None:
        return JSONResponse( content={"detail": "No image uploaded"},status_code=400)

    try:
        nutrition = await getNutrition(uploadInput)
        parsed = extract_json(nutrition)
    except ValueError as e:
        return JSONResponse( content={"detail": str(e)},status_code=400)
    return JSONResponse(content=parsed, status_code=200)


def extract_json(s: str):
    m = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', s, flags=re.IGNORECASE)
    if m:
        s = m.group(1)
    return json.loads(s.strip())