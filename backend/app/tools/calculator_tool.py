
from app.tools.utils import sanitize_calculation

def calculator(expression: str):

    try:
        safe_expression = sanitize_calculation(expression)

        result = eval(safe_expression)

        return str(result)

    except Exception:
        return "Invalid calculation"