def supervisor_agent(state):

    task = state["task"].lower()

    history = " ".join(state.get("chat_history", []))

    combined_context = f"{history} {task}"

    rag_keywords = [
        "document",
        "pdf",
        "resume",
        "uploaded",
        "file",
        "skills",
        "experience",
        "projects"
    ]

    analytics_keywords = [
    "csv",
    "excel",
    "dataset",
    "data",
    "analyze",
    "analysis",
    "report"
    ]


    memory_keywords = [
        "remember",
        "memory"
    ]

    if any(word in combined_context for word in rag_keywords):

        route = "rag"

    elif any(word in task for word in memory_keywords):

        route = "memory"

    elif any(word in combined_context for word in analytics_keywords):

        route = "analytics"

    elif any(word in task for word in [
    "research",
    "latest",
    "news",
    "api",
    "fetch",
    "data"
    ]):

        route = "planner"
    else:

        route = "direct"

    return {
        **state,
        "route": route
    }