import datetime as dt
from typing import Sequence, List

from sqlalchemy import select

from db.models.items import FixedEvent, FloatingTask
from db.session import get_db


def list_items_for_calendar_date(calendar_id: int, date: dt.date) -> List[FixedEvent | FloatingTask]:
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
