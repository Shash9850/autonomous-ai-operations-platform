from langchain_groq import ChatGroq
from app.config.settings import settings

def get_executor_llm():
    return ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model="llama-3.1-8b-instant",
        temperature=0,
        max_retries=3,
        timeout=60
    )