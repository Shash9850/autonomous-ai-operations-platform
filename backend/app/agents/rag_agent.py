
from app.tools.rag_tool import rag_search

def rag_agent(state):

    query = state["task"]

    result = rag_search(query)

    return {
        **state,
        "results": [result]
    }