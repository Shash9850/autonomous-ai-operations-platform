
from click import prompt

from app.core.llm import get_planner_llm
from app.core import llm

def generate_insights(analysis):

    prompt = f"""
    You are a senior business data analyst.

    Analyze the following dataset statistics
    and generate meaningful business insights.

    Dataset Analysis:
    {analysis}

    Generate:
    - key observations
    - data quality insights
    - business recommendations
    - potential use cases

    Keep response professional and structured.
    """

    llm = get_planner_llm()

    response = llm.invoke(prompt)

    return response.content



