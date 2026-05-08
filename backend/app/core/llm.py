from langchain_openai import ChatOpenAI
from app.config.settings import settings


'''
def get_planner_llm():
    return ChatOpenAI(
        api_key=settings.OPENAI_API_KEY,
        model="gpt-4o-mini",
        temperature=0
    )

'''


from langchain_groq import ChatGroq


def get_planner_llm():
    try:
    	return ChatGroq(
        	api_key=settings.GROQ_API_KEY,
        	model="llama-3.1-8b-instant",
        	temperature=0,
        	max_retries=3,
        	timeout=60
        )
    except Exception:
        return ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model="mixtral-8x7b-32768",
            temperature=0
        )


llm = get_planner_llm()