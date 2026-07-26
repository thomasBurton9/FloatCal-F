import datetime as dt
from collections import defaultdict
from typing import DefaultDict, Dict, List, Sequence

from sqlalchemy import delete, select

from db.models.calendars import Calendar, CalendarMember
from db.models.items import FixedEvent, FloatingTask
from db.queries.item_db import remove_event_session, remove_task_session
from db.session import get_db
from schemas.calendar_schemas import CreateCalendar
from schemas.item_schemas import CreateFixedEvent, CreateFloatingTask


# Could change to a more efficient way
def check_calendar_exists(calendar_id: int):
    calendar_exists_statement = select(Calendar.calendar_id).where(
        Calendar.calendar_id == calendar_id
    )

    with get_db() as session:
        return session.execute(calendar_exists_statement).scalar() is not None


def list_tasks_for_calendar_date(calendar_id: int, date: dt.date) -> List[FloatingTask]:
    floating_task_statement = (
        select(FloatingTask)
        .where(FloatingTask.calendar_id == calendar_id)
        .where(FloatingTask.date == date)
    )
    with get_db() as session:
        floating_task_result: Sequence[FloatingTask] = (
            session.execute(floating_task_statement).scalars().all()
        )

        return list(floating_task_result)


# Inclusive of start and end dates
def list_tasks_for_calendar_date_range(
    calendar_id: int, start_date: dt.date, end_date: dt.date
) -> Dict[dt.date, List[FloatingTask]]:
    floating_task_statement = (
        select(FloatingTask)
        .where(FloatingTask.calendar_id == calendar_id)
        .where(FloatingTask.date <= end_date, FloatingTask.date >= start_date)
    )

    with get_db() as session:
        floating_task_results: Sequence[FloatingTask] = (
            session.execute(floating_task_statement).scalars().all()
        )

        # Use defaultdict instead of regular dict to allow easy creation of new keys
        task_date_hashmap: DefaultDict[dt.date, List[FloatingTask]] = defaultdict(list)
        for task in floating_task_results:
            task_date_hashmap[task.date].append(task)

        return dict(task_date_hashmap)


def list_tasks_for_user_date_range(
    user_id: int, start_date: dt.date, end_date: dt.date
) -> Dict[dt.date, List[FloatingTask]]:

    with get_db() as session:
        calendar_id_statement = select(CalendarMember.calendar_id).where(
            CalendarMember.user_id == user_id
        )

        calendar_ids: Sequence[int] | None = (
            session.execute(calendar_id_statement).scalars().all()
        )

        if not calendar_ids:
            return defaultdict()

        floating_task_statement = (
            select(FloatingTask)
            .where(FloatingTask.calendar_id.in_(calendar_ids))
            .where(FloatingTask.date <= end_date, FloatingTask.date >= start_date)
        )

        floating_task_results: Sequence[FloatingTask] = (
            session.execute(floating_task_statement).scalars().all()
        )

        # Use defaultdict instead of regular dict to allow easy creation of new keys
        task_date_hashmap: DefaultDict[dt.date, List[FloatingTask]] = defaultdict(list)
        for task in floating_task_results:
            task_date_hashmap[task.date].append(task)

        return dict(task_date_hashmap)


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
        *floating_task_result,  # '*' is the unpack operator -> similar to ... in js
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


def add_floating_task(calendar_id: int, task_data: CreateFloatingTask) -> int:
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

        return new_floating_task.task_id


def check_member_in_calendar(calendar_id: int, user_id: int):
    user_in_calendar_statement = (
        select(CalendarMember.calendar_member_id)
        .where(CalendarMember.calendar_id == calendar_id)
        .where(CalendarMember.user_id == user_id)
    )
    with get_db() as session:
        return session.execute(user_in_calendar_statement).scalar() is not None


# Assumes data is already sanitised
def add_member_to_calendar(calendar_id: int, user_id: int):
    new_calendar_member_entry: CalendarMember = CalendarMember(
        calendar_id=calendar_id, user_id=user_id
    )

    with get_db() as session:
        session.add(new_calendar_member_entry)
        session.commit()


# Assumes data is already sanitised
def remove_member_from_calendar(calendar_id: int, user_id: int):
    with get_db() as session:
        remove_member_statement = (
            delete(CalendarMember)
            .where(CalendarMember.calendar_id == calendar_id)
            .where(CalendarMember.user_id == user_id)
        )

        session.execute(remove_member_statement)
        session.commit()


def create_calendar(user_id: int, data: CreateCalendar):
    new_calendar: Calendar = Calendar(
        name=data.name, colour=data.colour, created_by_user_id=user_id
    )

    with get_db() as session:
        session.add(new_calendar)
        session.flush()
        # Make sure new owner/creator has access to calendar
        new_member: CalendarMember = CalendarMember(
            calendar_id=new_calendar.calendar_id, user_id=user_id
        )
        session.add(new_member)
        session.commit()


# TODO: Currently leaves child records -> If foreign key enforcement is turned on this will error.
def delete_calendar(user_id: int, calendar_id: int):
    try:
        calendar: Calendar = get_calendar_info(calendar_id)
        if calendar.created_by_user_id != user_id:
            raise ValueError(
                "The user with specified user id did not created the selected calendar"
            )

    except ValueError as e:
        raise ValueError(str(e))

    with get_db() as session:
        delete_calendar_statement = (
            delete(Calendar)
            .where(Calendar.calendar_id == calendar_id)
            .where(Calendar.created_by_user_id == user_id)
        )
        get_tasks_statement = select(FloatingTask.task_id).where(
            FloatingTask.calendar_id == calendar_id
        )

        get_events_statement = select(FixedEvent.event_id).where(
            FixedEvent.calendar_id == calendar_id
        )

        task_ids: Sequence[int] = session.execute(get_tasks_statement).scalars().all()
        event_ids: Sequence[int] = session.execute(get_events_statement).scalars().all()

        for task_id in task_ids:
            remove_task_session(calendar_id, task_id, session)
        for event_id in event_ids:
            remove_event_session(calendar_id, event_id, session)

        delete_calendar_members_statement = delete(CalendarMember).where(
            CalendarMember.calendar_id == calendar_id
        )
        session.execute(delete_calendar_members_statement)
        session.execute(delete_calendar_statement)
        session.commit()


def get_calendar_info(calendar_id: int) -> Calendar:
    if not check_calendar_exists(calendar_id):
        raise ValueError("Calendar with specified id does not exist")
    calendar_info_statement = select(Calendar).where(
        Calendar.calendar_id == calendar_id
    )

    with get_db() as session:
        calendar: Calendar | None = session.execute(calendar_info_statement).scalar()
        if not calendar:
            raise ValueError("Calendar with specified id does not exist")
        return calendar


def get_calendar_member_entries(calendar_id: int) -> list[CalendarMember]:
    from db.session import get_db

    calendar_member_statement = select(CalendarMember).where(
        CalendarMember.calendar_id == calendar_id
    )

    with get_db() as session:
        calendar_member_entries = (
            session.execute(calendar_member_statement).scalars().all()
        )
        return list(calendar_member_entries)
