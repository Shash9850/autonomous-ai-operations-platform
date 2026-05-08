from app.tools.tool_registry import TOOLS
from app.tools.tool_schema import ToolDecision
from app.core.groq_llm import get_executor_llm

def direct_agent(state):

    llm = get_executor_llm()

    structured_llm = llm.with_structured_output(ToolDecision)

    prompt = f"""
    Choose the best tool for this task.

    Available tools:

    - search → internet research
    - calculator → math calculations
    - rag → uploaded document retrieval

    Task:
    {state['task']}
    """

    decision = structured_llm.invoke(prompt)

    tool_name = decision.tool
    tool_input = decision.input

    tool_function = TOOLS.get(tool_name)

    if tool_function:
        result = tool_function(tool_input)
    else:
        result = f"Invalid tool: {tool_name}"

    return {
        **state,
        "results": [result]
    }