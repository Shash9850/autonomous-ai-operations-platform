from urllib import response

from app.core.llm import get_planner_llm
from app.agents import state


def synthesis_agent(state):

    llm = get_planner_llm()

    history = "\n".join(state.get("chat_history", []))

    prompt = f"""
You are a professional AI operations assistant.

Use the provided execution results to generate a clean,
concise, and user-friendly final response.

DO NOT expose:
- internal reasoning
- raw execution traces
- conversation history
- debugging information

Current User Task:
{state['task']}

Execution Results:
{state['results']}

Generate a polished final answer.
"""

    response = llm.invoke(prompt)

    updated_history = state.get("chat_history", [])

    updated_history.append(f"User: {state['task']}")

    updated_history.append(f"AI: {response.content}")

    return {
    **state,
    "final_response": response.content,
    "chat_history": updated_history,
    "chart_path": state.get("chart_path"),
    "report_path": state.get("report_path")
}
