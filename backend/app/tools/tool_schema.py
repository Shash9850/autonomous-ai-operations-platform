from pydantic import BaseModel

class ToolDecision(BaseModel):
    tool: str
    input: str