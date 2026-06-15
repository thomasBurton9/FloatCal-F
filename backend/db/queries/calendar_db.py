import datetime as dt
from typing import List, Sequence

from sqlalchemy import select

from db.models.items import FixedEvent, FloatingTask
from db.models.calendars import Calendar
from db.session import get_db
from schemas.item_schemas import CreateFixedEvent, CreateFloatingTask


# Could change to a more efficient way
def check_calendar_exists(calendar_id: int):
    calendar_exists_statement = select(Calendar.calendar_id).where(
        Calendar.calendar_id == calendar_id
    )

    with get_db() as session:
        return session.execute(calendar_exists_statement).scalar() is not None


def list_items_for_calendar_date(
    calendar_id: int, date: dt.date
) -> List[FixedEvent | FloatingTask]:
    fixed_event_statement = (
        select(FixedEvent)
        .where(FixedEvent.calendar_id == calendar_id)
        .where(FixedEvent.date == date)
        .order_by(FixedEvent.start_time)
    )
    floating_task_statement = (
        select(FloatingTask)
        .where(FloatingTask.calendar_id == calendar_id)
        .where(FloatingTask.date == date)
        .where(FloatingTask.scheduled_start.is_not(None))
    )

    with get_db() as session:
        fixed_event_result: Sequence[FixedEvent] = (
            session.execute(fixed_event_statement).scalars().all()
        )
        floating_task_result: Sequence[FloatingTask] = (
            session.execute(floating_task_statement).scalars().all()
        )

    combined: List[FixedEvent | FloatingTask] = [
        *fixed_event_result,
        *floating_task_result,
    ]  # Combine the 2 lists

    def sort_helper(item):
        return item.start_time if isinstance(item, FixedEvent) else item.scheduled_start

    combined.sort(key=sort_helper)

    return combined


def add_fixed_event(calendar_id: int, event_data: CreateFixedEvent):
    with get_db() as session:
        new_fixed_event: FixedEvent = FixedEvent(
            calendar_id=calendar_id,
            name=event_data.name,
            date=event_data.date,
            notes=event_data.notes,
            recurrence_rule=event_data.recurrence_rule,
            reminder=event_data.reminder,
            start_time=event_data.start_time,
            end_time=event_data.end_time,
        )

        session.add(new_fixed_event)
        session.commit()


def add_floating_task(calendar_id: int, task_data: CreateFloatingTask):
    with get_db() as session:
        new_floating_task: FloatingTask = FloatingTask(
            calendar_id=calendar_id,
            name=task_data.name,
            date=task_data.date,
            duration_minutes=task_data.duration_minutes,
            notes=task_data.notes,
            recurrence_rule=task_data.recurrence_rule,
            reminder=task_data.reminder,
            preferred_window=task_data.preferred_window,
            scheduled_start=task_data.scheduled_start,
            manually_scheduled=task_data.manually_scheduled,
        )

        session.add(new_floating_task)
        session.commit()
