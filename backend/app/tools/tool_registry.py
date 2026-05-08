
from app.tools.calculator_tool import calculator
from app.tools.rag_tool import rag_search
from app.tools.memory_tool import remember
from app.tools.memory_tool import recall
from app.tools.search_tool import search_web
from app.tools.api_tool import call_api

TOOLS = {
    "search": search_web,
    "calculator": calculator,
    "rag": rag_search,
    "remember": remember,
    "recall": recall,
    "api": call_api
}