from collections.abc import Sequence

from sqlalchemy import select

from db.models.calendars import Calendar, CalendarMember
from db.models.invites import Invite
from db.queries.calendar_db import get_calendar_info
from db.session import get_db


def invite_user_to_calendar(
    user_invite_from_id: int, user_to_invite_id: int, calendar_id: int
) -> int:

    search_for_invite_statement = (
        select(Invite)
        .where(Invite.invite_from_user_id == user_invite_from_id)
        .where(Invite.invite_to_user_id == user_to_invite_id)
        .where(Invite.invite_calendar_id == calendar_id)
        .where(Invite.status != "declined")
    )
    with get_db() as session:
        invite: Invite | None = session.execute(search_for_invite_statement).scalar()

        if invite:
            raise ValueError(
                "User is either already in the selected calendar, or has a pending invite"
            )

        new_invite: Invite = Invite(
            invite_from_user_id=user_invite_from_id,
            invite_to_user_id=user_to_invite_id,
            invite_calendar_id=calendar_id,
        )
        session.add(new_invite)
        session.commit()

        return new_invite.invite_id


def respond_to_invite(user_id: int, invite_id: int, accepted: bool):
    get_invite_statement = (
        select(Invite)
        .where(Invite.invite_id == invite_id)
        .where(Invite.invite_to_user_id == user_id)
    )

    with get_db() as session:
        invite: Invite | None = session.execute(get_invite_statement).scalar()

        if not invite:
            raise ValueError("Invite with specified id's does not exist")

        invite.status = "accepted" if accepted else "declined"

        if accepted:
            new_calendar_member: CalendarMember = CalendarMember(
                calendar_id=invite.invite_calendar_id, user_id=user_id
            )

            session.add(new_calendar_member)

        session.commit()


def get_invites_to_user(user_id: int) -> list[Invite]:
    get_invite_statement = select(Invite).where(Invite.invite_to_user_id == user_id)

    with get_db() as session:
        invites: Sequence[Invite] = (
            session.execute(get_invite_statement).scalars().all()
        )

        return list(invites)


# potentially not needed by frontend
def get_invites_from_user(user_id: int) -> list[Invite]:
    get_invite_statement = select(Invite).where(Invite.invite_from_user_id == user_id)

    with get_db() as session:
        invites: Sequence[Invite] = (
            session.execute(get_invite_statement).scalars().all()
        )

        return list(invites)


# user id required to make sure only the owner can request the id
def get_invites_for_calendar(user_id: int, calendar_id: int) -> list[Invite]:
    calendar: Calendar = get_calendar_info(calendar_id)
    if not calendar or calendar.created_by_user_id != user_id:
        raise ValueError("The invites can only be accessed by the owner")

    get_invite_statement = select(Invite).where(
        Invite.invite_calendar_id == calendar_id
    )

    with get_db() as session:
        invites: Sequence[Invite] = (
            session.execute(get_invite_statement).scalars().all()
        )

        return list(invites)
