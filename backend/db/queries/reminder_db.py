import datetime as dt
from typing import Sequence

from sqlalchemy import delete, select

from db.models.reminders import CompletionLog, Reminder
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


def get_completion_logs(
    task_id: int, date: dt.date | None = None
) -> Sequence[CompletionLog]:
    log_statement = select(CompletionLog).where(CompletionLog.task_id == task_id)
    if date:
        log_statement = log_statement.where(CompletionLog.completed_date == date)

    with get_db() as session:
        completion_logs: Sequence[CompletionLog] = (
            session.execute(log_statement).scalars().all()
        )
        return completion_logs


def mark_task_complete(task_id: int, date: dt.date):
    new_completion_log: CompletionLog = CompletionLog(
        task_id=task_id, completed_date=date
    )

    with get_db() as session:
        session.add(new_completion_log)
        session.commit()


def mark_task_incomplete(task_id: int, date: dt.date):
    delete_completion_log_statement = (
        delete(CompletionLog)
        .where(CompletionLog.task_id == task_id)
        .where(CompletionLog.completed_date == date)
    )

    with get_db() as session:
        session.execute(delete_completion_log_statement)
        session.commit()
