from app.tools.tool_registry import TOOLS


def executor_agent(state):

    plan = state["plan"]

    results = []

    for step in plan:

        step_lower = step.lower()

        if any(word in step_lower for word in [
            "research",
            "search",
            "market",
            "latest",
            "find"
        ]):

            result = TOOLS["search"](step)

        elif any(word in step_lower for word in [
            "calculate",
            "math",
            "*",
            "+"
        ]):

            result = TOOLS["calculator"](step)

        elif "api" in step_lower:

            result = TOOLS["api"](
                "https://jsonplaceholder.typicode.com/todos/1"
            )

        else:

            result = f"Executed task: {step}"

        results.append(result)

    return {
        **state,
        "results": results,
        "current_step": len(plan)
    }