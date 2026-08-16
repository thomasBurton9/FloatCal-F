from sqlalchemy import select
from typing_extensions import Sequence

from db.models.invites import Invite
from db.session import get_db


def invite_user_to_calendar(
    user_invite_from_id: int, user_to_invite_id, calendar_id: int
) -> int:
    raise NotImplementedError


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
    raise NotImplementedError
