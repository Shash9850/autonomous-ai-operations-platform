import re

def sanitize_calculation(expression: str):

    """
    Extract only safe math expressions.
    """

    cleaned = re.sub(r"[^0-9+\-*/().]", "", expression)

    return cleaned