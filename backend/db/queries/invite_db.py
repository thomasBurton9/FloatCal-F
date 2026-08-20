from collections.abc import Sequence

from sqlalchemy import select

from db.models.calendars import Calendar, CalendarMember
from db.models.invites import Invite
from db.models.users import User
from db.queries.calendar_db import get_calendar_info
from db.session import get_db
from schemas.invite_schemas import InviteWithInfo


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

    get_calendar_statement = select(Calendar.created_by_user_id).where(
        Calendar.calendar_id == calendar_id
    )
    with get_db() as session:
        created_user_calendar_id: int | None = session.execute(
            get_calendar_statement
        ).scalar()

        if not created_user_calendar_id:
            raise ValueError("Calendar with specified id does not exist")

        if created_user_calendar_id != user_invite_from_id:
            raise ValueError("Only the creator of a calendar can invite someone to it")

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

        if invite.status != "open":
            raise ValueError("You can only respond to unresponded invites")
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


def get_invites_to_user_info(user_id: int) -> list[InviteWithInfo]:
    get_invite_statement = select(Invite).where(Invite.invite_to_user_id == user_id)

    with get_db() as session:
        invites: Sequence[Invite] = (
            session.execute(get_invite_statement).scalars().all()
        )

        calendar_ids: list[int] = [invite.invite_calendar_id for invite in invites]
        get_calendar_statement = select(Calendar).where(
            Calendar.calendar_id.in_(calendar_ids)
        )
        calendars: Sequence[Calendar] = (
            session.execute(get_calendar_statement).scalars().all()
        )

        user_ids: list[int] = [invite.invite_from_user_id for invite in invites]
        get_user_statement = select(User).where(User.user_id.in_(user_ids))
        users: Sequence[User] = session.execute(get_user_statement).scalars().all()

        calendar_names: dict[int, str] = {
            calendar.calendar_id: calendar.name for calendar in calendars
        }
        calendar_colours: dict[int, str] = {
            calendar.calendar_id: calendar.colour for calendar in calendars
        }
        user_names: dict[int, str] = {user.user_id: user.display_name for user in users}

        return [
            InviteWithInfo(
                invite_id=invite.invite_id,
                invite_from_user_id=invite.invite_from_user_id,
                invite_calendar_id=invite.invite_calendar_id,
                invite_to_user_id=invite.invite_to_user_id,
                status=invite.status,
                calendar_name=calendar_names[invite.invite_calendar_id],
                calendar_colour=calendar_colours[invite.invite_calendar_id],
                inviter_display_name=user_names[invite.invite_from_user_id],
            )
            for invite in invites
        ]


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
