
from pydantic import BaseModel
from typing import List

class TaskRequest(BaseModel):
    task: str

class TaskResponse(BaseModel):

    task: str
    route: str
    plan: List[str]
    current_step: int
    results: List[str]
    final_response: str