from fastapi import Header
from jose import jwt

from app.db.database import SessionLocal
from app.db.models import User

SECRET_KEY = "SUPER_SECRET_KEY"
ALGORITHM = "HS256"

def get_current_user(
    authorization: str = Header(None)
):

    if not authorization:

        return None

    try:

        token = authorization.split(" ")[1]

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload["user_id"]

        db = SessionLocal()

        user = db.query(User).filter(
            User.id == user_id
        ).first()

        db.close()

        return user

    except:

        return None