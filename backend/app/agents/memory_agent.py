from app.tools.memory_tool import remember
from app.tools.memory_tool import recall

def memory_agent(state):

    task = state["task"].lower()

    if "remember" in task:

        result = remember(state["task"])

    else:

        result = recall(state["task"])

    return {
        **state,
        "results": [result]
    }