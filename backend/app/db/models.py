from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    Text
)

from sqlalchemy.orm import relationship

from app.db.database import Base

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    email = Column(
        String,
        unique=True,
        index=True
    )

    password = Column(String)

class ChatSession(Base):

    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, default="New Chat")

    pinned = Column(Boolean, default=False)

    messages = relationship(
        "ChatMessage",
        back_populates="chat",
        cascade="all, delete"
    )

    user_id = Column(
    Integer,
    ForeignKey("users.id")
)


class ChatMessage(Base):

    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)

    role = Column(String)

    content = Column(Text)

    chat_id = Column(
        Integer,
        ForeignKey("chat_sessions.id")
    )


    
    chat = relationship(
        "ChatSession",
        back_populates="messages"
    )