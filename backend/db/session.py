import os
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from db.base import Base

# Import all tables so they get created on application run and are not missing
# When .create_all() runs
from db.models.calendars import Calendar, CalendarMember
from db.models.items import FixedEvent, FloatingTask
from db.models.reminders import CompletionLog, Reminder
from db.models.settings import Setting
from db.models.users import User

# Inform typechecker that the imports above are used.
__all__ = [
    "Calendar",
    "CalendarMember",
    "FixedEvent",
    "FloatingTask",
    "CompletionLog",
    "Reminder",
    "Setting",
    "User",
]


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


Base.metadata.create_all(engine)


@contextmanager
def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
