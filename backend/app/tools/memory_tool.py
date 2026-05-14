
from app.db.database import SessionLocal
from app.db.models import Memory

def remember(user_id, content):

    db = SessionLocal()

    memory = Memory(
        user_id=user_id,
        content=content
    )

    db.add(memory)

    db.commit()

    db.close()

    return "Memory saved successfully"

def recall(user_id):

    db = SessionLocal()

    memories = db.query(Memory).filter(
        Memory.user_id == user_id
    ).all()

    db.close()

    return [
        m.content
        for m in memories
    ]

def get_user_memories(user_id):

    db = SessionLocal()

    memories = db.query(Memory).filter(
        Memory.user_id == user_id
    ).all()

    db.close()

    return [
        m.content
        for m in memories
    ]