from collections.abc import Sequence

from sqlalchemy import or_, select

from db.session import CalendarMember, FixedEvent, FloatingTask, get_db


# Currently potential infinite payload, though this is generally fine for a family calendar
# ~1kb per event max, 1000 events ~1mb
# Currently searching for both strings in both notes and names with equal weighting
def search_items(user_id: int, query: str) -> list[FloatingTask | FixedEvent]:

    get_calendar_ids_statement = select(CalendarMember.calendar_id).where(
        CalendarMember.user_id == user_id
    )

    with get_db() as session:
        calendar_ids: Sequence[int] = (
            session.execute(get_calendar_ids_statement).scalars().all()
        )

        if len(calendar_ids) == 0:
            return []

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

        events: Sequence[FixedEvent] = (
            session.execute(get_event_statement).scalars().all()
        )
        tasks: Sequence[FloatingTask] = (
            session.execute(get_task_statement).scalars().all()
        )

        return [
            *events,
            *tasks,
        ]  # Currently all events are returned at the start, before all tasks
