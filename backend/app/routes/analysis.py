from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse

from app.services.prompt_service import PromptTemplateService
from app.services.gemini_service import GeminiService
from app.services.image_service import ImageService

template_service = PromptTemplateService()
image_service = ImageService()
gemini = GeminiService().model


router = APIRouter()

@router.post("/upload", tags=["analysis"])
async def upload(uploadInput: UploadFile=File(...)):
    try:
        proceeded = image_service.process_upload(
            filename=uploadInput.filename or "",
            fileobj=uploadInput.file,
            )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    input_prompt = template_service.nutrition_prompt(strict_json=True) 
    
    try:  
        response = gemini.generate_content([input_prompt, proceeded["image_part"]])
        result_text = getattr(response, "text", None) or ""
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini API error : {e}")
    
    return JSONResponse(
        content={
            "result": result_text,
            "image" : proceeded["encode_image"],
            "mime_type" : proceeded["mime_type"],
        },
        status_code=200,
    )
    