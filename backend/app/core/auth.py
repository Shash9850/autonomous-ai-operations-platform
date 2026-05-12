from jose import jwt

SECRET_KEY = "SUPER_SECRET_KEY"

ALGORITHM = "HS256"


def decode_token(token: str):

    payload = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM]
    )

    return payload