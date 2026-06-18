from sqlalchemy import delete, select

from db.models.items import FixedEvent, FloatingTask
from db.models.reminders import CompletionLog, Reminder
from db.session import get_db


# Assumes calendar_id exists - prior validation is required
def check_event_exists(calendar_id: int, event_id: int):
    event_exists_statement = (
        select(FixedEvent.event_id)
        .where(FixedEvent.calendar_id == calendar_id)
        .where(FixedEvent.event_id == event_id)
    )

    with get_db() as session:
        return session.execute(event_exists_statement).scalar() is not None


def check_task_exists(calendar_id: int, task_id: int):

    task_exists_statement = (
        select(FloatingTask.task_id)
        .where(FloatingTask.calendar_id == calendar_id)
        .where(FloatingTask.task_id == task_id)
    )

    with get_db() as session:
        return session.execute(task_exists_statement).scalar() is not None


def remove_event(calendar_id: int, event_id: int):
    delete_event_statement = (
        delete(FixedEvent)
        .where(FixedEvent.calendar_id == calendar_id)
        .where(FixedEvent.event_id == event_id)
    )

    delete_reminder_statement = delete(Reminder).where(Reminder.event_id == event_id)

    with get_db() as session:
        session.execute(delete_event_statement)
        session.execute(delete_reminder_statement)
        session.commit()


def remove_task(calendar_id: int, task_id: int):
    delete_task_statement = (
        delete(FloatingTask)
        .where(FloatingTask.calendar_id == calendar_id)
        .where(FloatingTask.task_id == task_id)
    )

    delete_reminder_statement = delete(Reminder).where(Reminder.task_id == task_id)

    delete_completion_statement = delete(CompletionLog).where(
        CompletionLog.task_id == task_id
    )
    with get_db() as session:
        session.execute(delete_task_statement)
        session.execute(delete_reminder_statement)
        session.execute(delete_completion_statement)
        session.commit()
