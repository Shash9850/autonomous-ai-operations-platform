from fastapi import APIRouter
from sqlalchemy.orm import Session
from fastapi import Depends

from passlib.context import CryptContext
from jose import jwt

from app.db.database import SessionLocal
from app.db.models import User

SECRET_KEY = "SUPER_SECRET_KEY"

ALGORITHM = "HS256"

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

router = APIRouter()


def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()


@router.post("/signup")
def signup(
    user_data: dict,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user_data["email"]
    ).first()

    if existing_user:

        return {
            "error": "User already exists"
        }

    password = user_data["password"][:72]

    hashed_password = pwd_context.hash(
        password
    )

    new_user = User(

        email=user_data["email"],

        password=hashed_password

    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    token = jwt.encode(
        {
            "user_id": new_user.id
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return {
        "token": token
    }


@router.post("/login")
def login(
    user_data: dict,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == user_data["email"]
    ).first()

    if not user:

        return {
            "error": "Invalid credentials"
        }

    password = user_data["password"][:72]

    valid_password = pwd_context.verify(
        password,
        user.password
    )

    if not valid_password:

        return {
            "error": "Invalid credentials"
        }

    token = jwt.encode(
        {
            "user_id": user.id
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return {
        "token": token
    }