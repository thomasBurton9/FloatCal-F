from collections.abc import Sequence
from datetime import date

from sqlalchemy import or_, select

from db.session import Calendar, CalendarMember, FixedEvent, FloatingTask, get_db
from schemas.search_schemas import FixedSearchEvent, FloatingSearchTask


# Currently potential infinite payload, though this is generally fine for a family calendar
# ~1kb per event max, 1000 events ~1mb
# Currently searching for both strings in both notes and names with equal weighting
def search_items(
    user_id: int, query: str, current_only: bool = False
) -> list[FloatingSearchTask | FixedSearchEvent]:

    get_calendar_ids_statement = select(CalendarMember.calendar_id).where(
        CalendarMember.user_id == user_id
    )

    with get_db() as session:
        calendar_ids: Sequence[int] = (
            session.execute(get_calendar_ids_statement).scalars().all()
        )

        if len(calendar_ids) == 0:
            return []
        get_calendar_names_statement = select(
            Calendar.calendar_id, Calendar.name
        ).where(Calendar.calendar_id.in_(calendar_ids))

        calendar_names: dict[int, str] = dict(
            session.execute(get_calendar_names_statement).tuples().all()
        )

        search_query = (
            f"%{query}%"  # Use "%" so the query can be located anywhere in the name
        )

        get_event_statement = (
            select(FixedEvent)
            .where(FixedEvent.calendar_id.in_(calendar_ids))
            .where(
                or_(
                    FixedEvent.name.ilike(search_query),
                    FixedEvent.notes.ilike(search_query),
                )
            )
        )

        get_task_statement = (
            select(FloatingTask)
            .where(FloatingTask.calendar_id.in_(calendar_ids))
            .where(
                or_(
                    FloatingTask.name.ilike(search_query),
                    FloatingTask.notes.ilike(search_query),
                )
            )
        )

        if current_only:
            get_event_statement = get_event_statement.where(
                FixedEvent.date >= date.today()
            )
            get_task_statement = get_task_statement.where(
                FloatingTask.date >= date.today()
            )

        events: Sequence[FixedEvent] = (
            session.execute(get_event_statement).scalars().all()
        )
        tasks: Sequence[FloatingTask] = (
            session.execute(get_task_statement).scalars().all()
        )

        updated_events = []

        for event in events:
            new_event = FixedSearchEvent(
                event_id=event.event_id,
                calendar_id=event.calendar_id,
                calendar_name=calendar_names[event.calendar_id],
                name=event.name,
                date=event.date,
                start_time=event.start_time,
                end_time=event.end_time,
                notes=event.notes,
                recurrence_rule=event.recurrence_rule,
                reminder=event.reminder,
            )
            updated_events.append(new_event)

        updated_tasks = []

        for task in tasks:
            new_task = FloatingSearchTask(
                task_id=task.task_id,
                calendar_id=task.calendar_id,
                calendar_name=calendar_names[task.calendar_id],
                name=task.name,
                date=task.date,
                duration_minutes=task.duration_minutes,
                notes=task.notes,
                recurrence_rule=task.recurrence_rule,
                reminder=task.reminder,
                preferred_window=task.preferred_window,
                scheduled_start=task.scheduled_start,
                manually_scheduled=task.manually_scheduled,
            )
            updated_tasks.append(new_task)
        return [
            *updated_events,
            *updated_tasks,
        ]  # Currently all events are returned at the start, before all tasks
