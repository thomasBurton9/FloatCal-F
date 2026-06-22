from typing import Sequence

from sqlalchemy import select

from db.models.calendars import Calendar, CalendarMember
from db.models.users import User
from db.session import get_db


def check_user_exists(user_id: int):
    user_exists_statement = select(User.user_id).where(User.user_id == user_id)

    with get_db() as session:
        return session.execute(user_exists_statement).scalar() is not None


# Making a calendar also results in a membership record
def get_user_calendars(user_id: int):
    user_member_calendar_statement = select(CalendarMember.calendar_id).where(
        CalendarMember.user_id == user_id
    )

    with get_db() as session:
        calendar_ids: Sequence[int] = (
            session.execute(user_member_calendar_statement).scalars().all()
        )

        calendar_statement = select(Calendar).where(
            Calendar.calendar_id.in_(calendar_ids)
        )

        calendars: Sequence[Calendar] = (
            session.execute(calendar_statement).scalars().all()
        )
        return calendars
