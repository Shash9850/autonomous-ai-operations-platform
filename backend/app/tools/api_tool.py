import requests


def call_api(url: str):

    try:

        response = requests.get(
            url,
            timeout=10
        )

        return response.text[:3000]

    except Exception as e:

        return f"API Error: {str(e)}"