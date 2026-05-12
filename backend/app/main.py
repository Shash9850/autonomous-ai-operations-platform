import os
from app.db.database import engine
from app.db.models import Base
from app.api.chat_routes import router as chat_router

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.config.settings import settings

from app.api.routes import router
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth_routes import router as auth_router

Base.metadata.create_all(bind=engine)

os.environ["LANGCHAIN_API_KEY"] = settings.LANGCHAIN_API_KEY
os.environ["LANGCHAIN_TRACING_V2"] = settings.LANGCHAIN_TRACING_V2
os.environ["LANGCHAIN_PROJECT"] = settings.LANGCHAIN_PROJECT

app = FastAPI(
    title="Autonomous Business Operations Agent",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/storage",
    StaticFiles(directory="storage"),
    name="storage"
)

app.include_router(router)
app.include_router(chat_router)
app.include_router(auth_router)