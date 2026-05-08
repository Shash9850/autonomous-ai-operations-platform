from duckduckgo_search import DDGS


def search_web(query: str):

    results = []

    with DDGS() as ddgs:

        search_results = ddgs.text(
            query,
            max_results=5
        )

        for result in search_results:

            title = result.get("title", "")

            body = result.get("body", "")

            link = result.get("href", "")

            results.append(
                f"Title: {title}\n"
                f"Snippet: {body}\n"
                f"Link: {link}\n"
            )

    return "\n\n".join(results)