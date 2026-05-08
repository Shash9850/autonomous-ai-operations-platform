from app.core.llm import get_planner_llm
from app.agents.schema import Plan

def planner_agent(state):
    llm = get_planner_llm()

    structured_llm = llm.with_structured_output(Plan)

    prompt = f"""
    Break the following task into 3 to 5 clear high-level executable steps.

    Keep steps short and action-oriented.

    Task:
    {state['task']}
    """

    response = structured_llm.invoke(prompt)

    return {
        "task": state["task"],
        "plan": response.steps,
        "current_step": 0,
        "results": []
    }