import datetime as dt

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from db.models.items import FixedEvent, FloatingTask
from db.models.reminders import CompletionLog, Reminder
from db.session import get_db
from schemas.item_schemas import UpdateFixedEvent, UpdateFloatingTask


# Assumes calendar_id exists - prior validation is required
def check_event_exists(event_id: int, calendar_id: int | None = None):
    event_exists_statement = select(FixedEvent.event_id).where(
        FixedEvent.event_id == event_id
    )

    if calendar_id:
        event_exists_statement = event_exists_statement.where(
            FixedEvent.calendar_id == calendar_id
        )
    with get_db() as session:
        return session.execute(event_exists_statement).scalar() is not None


def check_task_exists(task_id: int, calendar_id: int | None = None):

    task_exists_statement = select(FloatingTask.task_id).where(
        FloatingTask.task_id == task_id
    )

    if calendar_id:
        task_exists_statement = task_exists_statement.where(
            FloatingTask.calendar_id == calendar_id
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


def remove_event_session(calendar_id: int, event_id: int, session: Session):
    delete_event_statement = (
        delete(FixedEvent)
        .where(FixedEvent.calendar_id == calendar_id)
        .where(FixedEvent.event_id == event_id)
    )

    delete_reminder_statement = delete(Reminder).where(Reminder.event_id == event_id)

    session.execute(delete_event_statement)
    session.execute(delete_reminder_statement)


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


def remove_task_session(calendar_id: int, task_id: int, session: Session):
    delete_task_statement = (
        delete(FloatingTask)
        .where(FloatingTask.calendar_id == calendar_id)
        .where(FloatingTask.task_id == task_id)
    )

    delete_reminder_statement = delete(Reminder).where(Reminder.task_id == task_id)

    delete_completion_statement = delete(CompletionLog).where(
        CompletionLog.task_id == task_id
    )
    session.execute(delete_task_statement)
    session.execute(delete_reminder_statement)
    session.execute(delete_completion_statement)


def manually_reschedule_task(task_id: int, time: dt.time):
    get_floating_task_statement = select(FloatingTask).where(
        FloatingTask.task_id == task_id
    )

    with get_db() as session:
        old_floating_task: FloatingTask | None = session.execute(
            get_floating_task_statement
        ).scalar()
        if old_floating_task is None:
            raise ValueError("Floating task with specified id does not exist")

        old_floating_task.manually_scheduled = True
        old_floating_task.scheduled_start = time

        session.commit()


def schedule_task(task_id: int, time: dt.time | None):
    get_floating_task_statement = select(FloatingTask).where(
        FloatingTask.task_id == task_id
    )

    with get_db() as session:
        old_floating_task: FloatingTask | None = session.execute(
            get_floating_task_statement
        ).scalar()
        if old_floating_task is None:
            raise ValueError("Floating task with specified id does not exist")

        old_floating_task.scheduled_start = time

        session.commit()


def update_fixed_event(calendar_id: int, event_id: int, event_data: UpdateFixedEvent):
    get_fixed_event_statement = (
        select(FixedEvent)
        .where(FixedEvent.calendar_id == calendar_id)
        .where(FixedEvent.event_id == event_id)
    )
    with get_db() as session:
        old_fixed_event: FixedEvent | None = session.execute(
            get_fixed_event_statement
        ).scalar()
        if old_fixed_event is None:
            raise ValueError("Fixed event with specified id does not exist")

        updates = event_data.model_dump(
            exclude_unset=True
        )  # Only turn the fields that we are updating into the dictionary

        new_start_time = updates.get("start_time", old_fixed_event.start_time)
        new_end_time = updates.get("end_time", old_fixed_event.end_time)

        if new_end_time <= new_start_time:
            raise ValueError("end_time must be after start_time")

        for field, value in updates.items():
            setattr(old_fixed_event, field, value)

        session.commit()


def update_floating_task(calendar_id: int, task_id: int, task_data: UpdateFloatingTask):
    get_floating_task_statement = (
        select(FloatingTask)
        .where(FloatingTask.calendar_id == calendar_id)
        .where(FloatingTask.task_id == task_id)
    )
    with get_db() as session:
        old_floating_task: FloatingTask | None = session.execute(
            get_floating_task_statement
        ).scalar()
        if old_floating_task is None:
            raise ValueError("Floating task with specified id does not exist")

        updates = task_data.model_dump(
            exclude_unset=True
        )  # Only turn the fields that we are updating into the dictionary

        for field, value in updates.items():
            setattr(old_floating_task, field, value)

        session.commit()


def get_event_info(event_id: int) -> FixedEvent:
    event_info_statement = select(FixedEvent).where(FixedEvent.event_id == event_id)

    with get_db() as session:
        fixed_event: FixedEvent | None = session.execute(event_info_statement).scalar()

        if fixed_event:
            return fixed_event
        else:
            raise ValueError("Event with specified id does not exist")


def get_task_info(task_id: int) -> FloatingTask:
    task_info_statement = select(FloatingTask).where(FloatingTask.task_id == task_id)

    with get_db() as session:
        floating_task: FloatingTask | None = session.execute(
            task_info_statement
        ).scalar()

        if floating_task:
            return floating_task
        else:
            raise ValueError("Task with specified id does not exist")
