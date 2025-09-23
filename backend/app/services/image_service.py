from PIL import Image, UnidentifiedImageError
import base64
import io

class ImageService:
    ALLOW_EXTS = (".jpg", ".jpeg", ".png")
    ALLOW_FORMATS = set(["JPEG", "PNG"])
    
    def process_upload(self, filename, fileobj):
        filename_lower = (filename or "").lower()
        if not filename_lower.endswith(self.ALLOW_EXTS):
            raise ValueError("Unsupported file format (only .jpg/.jpeg/.png)")
        
        try:
            img = Image.open(fileobj)
            img.load()
        except UnidentifiedImageError:
            raise ValueError("Uploaded file is not a valid image")
        
        pil_format = (img.format or "").upper()
        if pil_format not in self.ALLOW_FORMATS:
            if filename.endswith(".jpg") or filename.endswith(".jpeg"):
                pil_format = "JPEG"
            elif filename.endswith(".png"):
                pil_format = "PNG"
            else:
                raise ValueError("Unsupported image")
        
        mime_type = "image/jpeg" if pil_format == "JPEG" else "image/png"

        if pil_format == "JPEG" and img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        buf = io.BytesIO()
        img.save(buf, format=pil_format)
        encoded_image = base64.b64encode(buf.getvalue()).decode("utf-8")
    
        return {
            "mime_type" : mime_type,
            "encoded_image" : encoded_image,
            "pil_format" : pil_format,
            "image_part" : {"mime_type" : mime_type, "data" : encoded_image},
            }