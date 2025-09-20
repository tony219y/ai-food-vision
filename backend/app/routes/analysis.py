from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import google.generativeai as genai
from PIL import Image, UnidentifiedImageError
import base64
import os
import io

my_api_key_gemini = os.getenv('GOOGLE_API_KEY')
if not my_api_key_gemini:
    raise RuntimeError("There is no api key")
genai.configure(api_key=my_api_key_gemini)

router = APIRouter()

@router.post("/upload", tags=["analysis"])
async def upload(uploadInput: UploadFile=File(...)):
    if not uploadInput: raise HTTPException(status_code=400, detail="No file uploaded")
    filename = (uploadInput.filename or "").lower
    if not (filename.endswith(".jpg") or filename.endswith(".jpeg") or filename.endswith(".png")):
        raise HTTPException(status_code=400, detail="Unsupported file format (only .jpg/.jpeg/.png)")
    
    try:
        image = Image.open(uploadInput.file)
        image.load()
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="uploaded file is not valid image")
    finally:
        try:
            uploadInput.file.seek(0)
        except Exception:
            pass
        
    pil_format = (image.format or "").upper()
    if pil_format not in {"JPEG", "PNG"}:
        if filename.endswith(".jpg") or filename.endswith(".jpeg"):
            pil_format = "JPEG"
        elif filename.endswith(".png"):
            pil_format = "PNG"
        else:
            raise HTTPException(status_code=400, detail="Unsupported image")
        
    mime_type = "image/jpeg" if pil_format == "JPEG" else "image/png"
    
    bufferd = io.BytesIO()
    if pil_format == "JPEG" and image.mode in ("RGBA", "P"):
        image = image.convert("RGB")
    image.save(bufferd, format=pil_format)
    encoded_image = base64.b64encode(bufferd.getvalue()).decode("utf-8")
    
    image_part = [{"mime_type" : mime_type, "data" : encoded_image}]
    input_prompt = """You are expert nutritionist. From this image, give food name: serving size: then list each food item with estimate calories: protein: carbohydrate: fat: for each item in food then total result are in JSON Format string if it were not a food"""
    try:  
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content((input_prompt, image_part[0]))
        result_text = getattrw(response, "text", None) or ""
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini API error : {e}")
    
    return JSONResponse(
        content={
            "result": result_text,
            "image" : encoded_image
        },
        status_code=200,
    )
    