from pydantic import BaseModel
from typing import List

class Plan(BaseModel):
    steps: List[str]