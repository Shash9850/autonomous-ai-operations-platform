from app.db.database import SessionLocal
from app.db.models import Memory

def memory_agent(state):

    db = SessionLocal()

    print(state)

    memory = Memory(
        user_id=state["user_id"],
        content=state["task"]
    )

    db.add(memory)

    db.commit()

    db.close()

    return {
        **state,
        "results": [
            "Memory saved successfully"
        ]
    }