import os
from dotenv import load_dotenv

load_dotenv()


class Settings:

    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

    GROQ_API_KEY = os.getenv("GROQ_API_KEY")

    TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

    LANGCHAIN_API_KEY = os.getenv("LANGCHAIN_API_KEY")

    LANGCHAIN_TRACING_V2 = os.getenv("LANGCHAIN_TRACING_V2")

    LANGCHAIN_PROJECT = os.getenv("LANGCHAIN_PROJECT")

    EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")

    EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")


settings = Settings()