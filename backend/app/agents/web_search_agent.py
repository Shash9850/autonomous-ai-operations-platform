from app.tools.web_search_tool import (
    search_web
)

from app.core.llm import get_planner_llm


def web_search_agent(state):

    llm = get_planner_llm()

    query = state["task"]

    search_results = search_web(query)

    formatted_results = "\n\n".join([

        f"""
Title: {r['title']}

Content:
{r['body']}

Source:
{r['href']}
"""

        for r in search_results

    ])

    prompt = f"""
You are an AI research assistant.

Use the web search results below
to answer the user query clearly.

User Query:
{query}

Web Results:
{formatted_results}

Provide:
- concise answer
- important insights
- summarized findings
- cited sources
"""

    response = llm.invoke(prompt)

    return {

        **state,

        "results": [
            response.content
        ],

        "web_results": search_results

    }