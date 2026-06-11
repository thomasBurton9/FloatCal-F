import os
from pathlib import Path
from typing import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

load_dotenv(
    Path(__file__).resolve().parents[1] / ".env"
)  # Gets .env path directly given .env is not loaded automatically on windows

DATABASE_URL = f"sqlite:///{Path(__file__).resolve().parents[1] / 'app.db'}"  # Store database in backend/app.db
SQLALCHEMY_ECHO = os.getenv("SQLALCHEMY_ECHO", "False").lower() == "true"

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False
    },  # Allow multiple simulatenous connections
    echo=SQLALCHEMY_ECHO,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=True,
    expire_on_commit=False,  # For async use
)


def get_db() -> Generator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
