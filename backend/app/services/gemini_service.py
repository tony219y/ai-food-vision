import os
import google.generativeai as genai

class GeminiService:
    def __init__(self, model_name: str = "gemini-1.5-flash"):
        my_api_key_gemini = os.getenv('GOOGLE_API_KEY')
        if not my_api_key_gemini:
            raise RuntimeError("There is no api key")
        genai.configure(api_key=my_api_key_gemini)
        self.model_name = model_name
        self._model = genai.GenerativeModel(model_name)
    
    @property   
    def model(self):
        return self._model