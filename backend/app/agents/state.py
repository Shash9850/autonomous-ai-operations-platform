from typing import TypedDict, List

class AgentState(TypedDict):

    task: str
    route: str
    plan: List[str]
    current_step: int
    results: List[str]
    final_response: str
    chat_history: list
    uploaded_file: str
    chart_path: str
    report_path: str
    recipient_email: str
    chat_history: list