from app.tools.search_tool import search_web

def search_agent(state):

    query = state["task"]

    results = search_web(query)

    formatted_results = []

    for r in results:

        formatted_results.append(
            f"""
Title: {r['title']}
Snippet: {r['body']}
Link: {r['link']}
"""
        )

    return {
        **state,
        "results": formatted_results
    }