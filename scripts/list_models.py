import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(dotenv_path='backend/.env')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
keys = [k.strip() for k in GEMINI_API_KEY.split(',') if k.strip()]
genai.configure(api_key=keys[0])

print(f"Using key: {keys[0][:10]}...")

for m in genai.list_models():
    if 'embedContent' in m.supported_generation_methods:
        print(f"Supported embedding model: {m.name}")
