from fastapi import UploadFile, HTTPException
from PIL import Image, UnidentifiedImageError
import io, base64, os
import google.generativeai as genai
from dotenv import load_dotenv

import app.prompts.prompt as prompt
load_dotenv()

key = os.getenv("GOOGLE_API_KEY")
if not key:
    raise ValueError("GOOGLE_API_KEY not found")

try:
    genai.configure(api_key=key)
    model = genai.GenerativeModel('gemini-2.5-flash')
except Exception as e:
    print(f"Error configuration Gemini: {e}")
    

async def getNutrition(uploadInput: UploadFile):
        ai_prompt = prompt.prompt
        lower = uploadInput.filename.lower()
        if lower.endswith((".jpg", ".jpeg")):
            mime_type = "image/jpeg"
            save_format = "JPEG"
        elif lower.endswith(".png"):
            mime_type = "image/png"
            save_format = "PNG"
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        try:
            uploadInput.file.seek(0)
            img = Image.open(uploadInput.file)
            img.load()
        except UnidentifiedImageError:
            raise HTTPException(status_code=400, detail="Uploaded file is not a valid image")
        
        # encode base64
        buf = io.BytesIO()
        img.save(buf, format=save_format)
        encoded_image = base64.b64encode(buf.getvalue()).decode("utf-8")

        image_part = {
            "mime_type": mime_type,
            "data": encoded_image
        }

        response = model.generate_content([ai_prompt, image_part])
        result = response.text
        return result