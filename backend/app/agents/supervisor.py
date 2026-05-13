def supervisor_agent(state):

    task = state["task"].lower()

    history_messages = state.get(
        "chat_history",
        []
    )

    history = "\n".join([

        f"{msg['role']}: {msg['content']}"

        for msg in history_messages

    ])

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

    web_keywords = [
        "latest",
        "news",
        "today",
        "current",
        "recent",
        "research",
        "internet",
        "web",
        "search"
    ]

    planner_keywords = [
        "api",
        "fetch",
        "automation",
        "workflow"
    ]

    if any(word in combined_context for word in rag_keywords):

        route = "rag"

    elif any(word in task for word in memory_keywords):

        route = "memory"

    elif any(word in combined_context for word in analytics_keywords):

        route = "analytics"

    elif any(word in combined_context for word in web_keywords):

        route = "web_search"

    elif any(word in combined_context for word in planner_keywords):

        route = "planner"

    else:

        route = "direct"

    return {

        **state,

        "route": route

    }