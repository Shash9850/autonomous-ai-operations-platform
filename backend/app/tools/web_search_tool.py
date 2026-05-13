from ddgs import DDGS


def search_web(query, max_results=5):

    results_list = []

    with DDGS() as ddgs:

        results = ddgs.text(
            query,
            max_results=max_results
        )

        for r in results:

            results_list.append({

                "title": r.get("title"),

                "body": r.get("body"),

                "href": r.get("href")

            })

    return results_list