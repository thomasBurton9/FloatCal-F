from typing import Sequence

from sqlalchemy import select

from db.models.reminders import Reminder
from db.session import get_db


# Potentially add current date filtering
def get_event_reminders(event_id: int) -> Sequence[Reminder]:
    reminder_statement = select(Reminder).where(Reminder.event_id == event_id)

    with get_db() as session:
        reminders: Sequence[Reminder] = (
            session.execute(reminder_statement).scalars().all()
        )
        return reminders


# Potentially add current date filtering
def get_task_reminders(task_id: int) -> Sequence[Reminder]:
    reminder_statement = select(Reminder).where(Reminder.task_id == task_id)

    with get_db() as session:
        reminders: Sequence[Reminder] = (
            session.execute(reminder_statement).scalars().all()
        )
        return reminders
