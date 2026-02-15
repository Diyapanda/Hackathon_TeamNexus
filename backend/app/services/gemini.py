import google.generativeai as genai
import os
from dotenv import load_dotenv
import json

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

class GeminiService:
    # Model fallback list with verified names from genai.list_models()
    MODELS = [
        'models/gemini-2.0-flash',
        'models/gemini-flash-latest',
        'models/gemini-pro-latest',
        'models/gemini-2.0-flash-lite'
    ]

    @staticmethod
    async def generate_summary(doc_type: str, doc_data: dict):
        if not os.getenv("GEMINI_API_KEY"):
            return f"[Demo Mode] backend generated summary for {doc_type}. Context: {doc_data.get('diagnosis', 'Normal findings')}"

        last_error = None
        for model_name in GeminiService.MODELS:
            try:
                model = genai.GenerativeModel(model_name)
                prompt = f"""
                You are a helpful medical assistant. Summarize the following {doc_type} for a patient in simple, reassuring language. 
                Identify key findings, medications, and any follow-up actions needed.
                Data: {json.dumps(doc_data)}
                Keep it concise (100-150 words).
                """
                response = await model.generate_content_async(prompt)
                return response.text
            except Exception as e:
                print(f"Error with model {model_name}: {e}")
                last_error = e
                continue
        
        return f"Unable to generate summary. (Last error: {last_error})"

    @staticmethod
    async def get_chat_response(message: str, history: list, patient_context: dict):
        if not os.getenv("GEMINI_API_KEY"):
            return "I am currently in demo mode. Please provide a valid GEMINI_API_KEY to enable real-time medical insights."

        last_error = None
        for model_name in GeminiService.MODELS:
            try:
                print(f"Attempting chat with model: {model_name}")
                model = genai.GenerativeModel(model_name)
                
                system_instruction = f"""
                You are MediGuard AI, a digital healthcare assistant. 
                You have access to the patient's medical history: {json.dumps(patient_context)}.
                Provide helpful, accurate, and empathetic medical guidance. 
                Always remind the patient that you are an AI and they should consult a professional for critical decisions.
                """
                
                chat_history = []
                for msg in history:
                    role = "model" if msg["role"] in ["assistant", "bot"] else "user"
                    chat_history.append({"role": role, "parts": [msg["content"]]})

                chat = model.start_chat(history=chat_history)
                full_prompt = f"{system_instruction}\n\nPatient Query: {message}"
                
                response = await chat.send_message_async(full_prompt)
                return response.text
            except Exception as e:
                print(f"Error with model {model_name} in chat: {e}")
                last_error = e
                continue

        return "I'm having trouble processing your request even after multiple attempts. Please try again later."
