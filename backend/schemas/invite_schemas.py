from pydantic import BaseModel

from db.models.invites import invite_status


class InviteWithInfo(BaseModel):
    invite_id: int

    invite_from_user_id: int

    invite_calendar_id: int

    invite_to_user_id: int

    status: invite_status

    calendar_name: str

    calendar_colour: str

    inviter_display_name: str
