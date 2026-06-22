from typing import Sequence

from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher
from sqlalchemy import delete, select

from db.models.calendars import Calendar, CalendarMember
from db.models.items import FixedEvent, FloatingTask
from db.models.settings import Setting
from db.models.users import User
from db.queries.item_db import remove_event_session, remove_task_session
from db.session import get_db
from schemas.user_schemas import CreateUser, DeleteUser, UserLogin


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


def create_user(data: CreateUser) -> int:
    users_with_email_statement = select(User).where(User.email == data.email)

    with get_db() as session:
        if session.execute(users_with_email_statement).scalar() is not None:
            raise ValueError("User with the selected email already exists")

        password_hasher: PasswordHash = PasswordHash((Argon2Hasher(),))
        hashed_password: str = password_hasher.hash(data.password)
        
        new_user: User = User(
            email=data.email,
            password_hash=hashed_password,
            display_name=data.display_name,
        )
        session.add(new_user)
        session.flush()

        new_settings: Setting = Setting(user_id=new_user.user_id)
        session.add(new_settings)
        session.commit()
        return new_user.user_id  # Indicate success


def delete_user(user_id: int, data: DeleteUser) -> bool:
    user_with_email_statement = select(User).where(User.email == data.email)

    with get_db() as session:
        user: User | None = session.execute(user_with_email_statement).scalar()
        if not user:
            raise ValueError("User with specified email does not exist")

        if user.user_id != user_id:
            raise ValueError("Mismatch between user_id and email")
        password_hasher: PasswordHash = PasswordHash((Argon2Hasher(),))

        is_valid_password: bool = password_hasher.verify(
            data.password, user.password_hash
        )

        if not is_valid_password:
            raise ValueError("Invalid password")

        # In the future add a hierarchy / inheritance to the sqlalchemy tables to allow for easy automatic cascading deletion

        # Delete any membership records of the user
        delete_user_calendar_members_statement = delete(CalendarMember).where(
            CalendarMember.user_id == user.user_id
        )

        session.execute(delete_user_calendar_members_statement)

        delete_settings_statement = delete(Setting).where(
            Setting.user_id == user.user_id
        )

        session.execute(delete_settings_statement)

        get_user_owner_calendars_statement = select(Calendar.calendar_id).where(
            Calendar.created_by_user_id == user.user_id
        )
        calendar_ids: Sequence[int] = list(
            session.execute(get_user_owner_calendars_statement).scalars().all()
        )

        # Delete any membership records associated with the calendars that are to be deleted

        delete_calendar_members_statement = delete(CalendarMember).where(
            CalendarMember.calendar_id.in_(calendar_ids)
        )
        session.execute(delete_calendar_members_statement)
        # Potentially add a function for this in calendar_db.py

        to_delete_tasks: list[list[int]] = []

        to_delete_events: list[list[int]] = []
        for cal_id in calendar_ids:
            select_tasks_statement = select(FloatingTask.task_id).where(
                FloatingTask.calendar_id == cal_id
            )

            select_events_statement = select(FixedEvent.event_id).where(
                FixedEvent.calendar_id == cal_id
            )

            to_delete_tasks.append(
                list(session.execute(select_tasks_statement).scalars().all())
            )
            to_delete_events.append(
                list(session.execute(select_events_statement).scalars().all())
            )

        for i in range(len(calendar_ids)):
            for task_id in to_delete_tasks[i]:
                remove_task_session(
                    calendar_ids[i], task_id, session
                )  # Prevent duplicate sessions
            for event_id in to_delete_events[i]:
                remove_event_session(calendar_ids[i], event_id, session)

        delete_calendars_statement = delete(Calendar).where(
            Calendar.created_by_user_id == user.user_id
        )

        session.execute(delete_calendars_statement)
        delete_user_statement = delete(User).where(User.email == data.email)

        session.execute(delete_user_statement)
        session.commit()

        return True


def authenticate_user(data: UserLogin) -> int:
    users_with_email_statement = select(User).where(User.email == data.email)
    with get_db() as session:
        user: User | None = session.execute(users_with_email_statement).scalar()

        if user is None:
            raise ValueError("User with specified email does not exist")

        password_hasher = PasswordHash((Argon2Hasher(),))

        valid_password: bool = password_hasher.verify(data.password, user.password_hash)

        if not valid_password:
            raise ValueError("Invalid password")
        return user.user_id
