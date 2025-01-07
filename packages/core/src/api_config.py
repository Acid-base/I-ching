import os

import google.generativeai as genai
from google.auth.exceptions import DefaultCredentialsError


class APIConfig:
    @staticmethod
    def initialize_api():
        try:
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key:
                with open("api_key.txt") as f:
                    api_key = f.read().strip()

            if not api_key:
                raise ValueError("No API key found")

            genai.configure(api_key=api_key)
            # Verify the API key by making a test call
            model = genai.GenerativeModel("gemini-pro")
            response = model.generate_content("test")
            if not response:
                raise ValueError("API key validation failed")

        except (FileNotFoundError, DefaultCredentialsError) as e:
            raise Exception(f"API initialization failed: {str(e)}")
