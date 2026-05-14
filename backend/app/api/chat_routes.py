from fastapi import APIRouter
from sqlalchemy.orm import Session
from fastapi import Depends
from fastapi import Header
from app.core.auth import decode_token
from app.db.models import User
from fastapi import HTTPException

from app.db.database import SessionLocal
from app.db.models import (
    ChatSession,
    ChatMessage
)

router = APIRouter()


def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()


def get_current_user(
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):

    try:

        token = authorization.replace(
            "Bearer ",
            ""
        )

        payload = decode_token(token)

        if not payload:

            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        user = db.query(User).filter(
            User.id == payload["user_id"]
        ).first()

        if not user:

            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        return user

    except Exception:

        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )




@router.get("/chats")
def get_chats(
    
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
    
):
    


    chats = db.query(ChatSession).filter(
    ChatSession.user_id == current_user.id
).all()

    result = []

    for chat in chats:

        result.append({

            "id": chat.id,

            "title": chat.title,

            "pinned": chat.pinned,

            "messages": [

                {
                    "role": msg.role,
                    "content": msg.content
                }

                for msg in chat.messages

            ]

        })

    return result


@router.post("/chats")
def create_chat(
    chat_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    new_chat = ChatSession(

        title=chat_data.get(
            "title",
            "New Chat"
        ),

        pinned=chat_data.get(
            "pinned",
            False
        ),
        user_id=current_user.id

    )

    db.add(new_chat)

    db.commit()

    db.refresh(new_chat)

    return {
        "id": new_chat.id
    }


@router.post("/chats/{chat_id}/messages")
def add_message(

    chat_id: int,

    message_data: dict,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    chat = db.query(ChatSession).filter(
        ChatSession.id == chat_id,
        ChatSession.user_id == current_user.id
    ).first()

    if not chat:

        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )

    message = ChatMessage(

        role=message_data["role"],

        content=message_data["content"],

        chat_id=chat_id

    )

    db.add(message)

    db.commit()

    db.refresh(message)

    return {
        "success": True
    }



@router.delete("/chats/{chat_id}")
def delete_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    chat = db.query(ChatSession).filter(
    ChatSession.id == chat_id,
    ChatSession.user_id == current_user.id
    ).first()

    if chat:

        db.delete(chat)

        db.commit()

    return {
        "success": True
    }



@router.put("/chats/{chat_id}")
def update_chat(
    chat_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    chat = db.query(ChatSession).filter(
    ChatSession.id == chat_id,
    ChatSession.user_id == current_user.id
).first()

    if not chat:

        return {
            "error": "Chat not found"
        }

    if "title" in data:

        chat.title = data["title"]

    if "pinned" in data:

        chat.pinned = data["pinned"]

    db.commit()

    return {
        "success": True
    }