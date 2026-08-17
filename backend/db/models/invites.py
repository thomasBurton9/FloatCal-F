from typing import Literal

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base

invite_status = Literal["open", "declined", "accepted"]


class Invite(Base):
    __tablename__: str = "Invite"

    # __table_args__: tuple[CheckConstraint | UniqueConstraint, ...] = (
    #     CheckConstraint(
    #         "length(invite_from_user_email) BETWEEN 3 AND 127",
    #         name="email_length_check",
    #     ),
    #     CheckConstraint(
    #         "length(invite_from_user_name) BETWEEN 3 AND 24", name="name_length_check"
    #     ),
    #     # Implement this at a function entry layer instead of here
    #     # TODO: Review if this is the best choice
    #     # UniqueConstraint("invite_from_user_id", "invite_calendar_id", "invite_to_user_id", name="unique_calendar_user_pair")
    #     # UniqueConstraint("") // Check that only one active invite from a user to another one for one calendar and that is active
    #     # Check that the calendars user_created_by == invite_from_user_id
    # )
    invite_id: Mapped[int] = mapped_column(primary_key=True)

    invite_from_user_id: Mapped[int] = mapped_column(
        ForeignKey("Users.user_id"), nullable=False
    )

    invite_calendar_id: Mapped[int] = mapped_column(
        ForeignKey("Calendars.calendar_id"), nullable=False
    )
    invite_to_user_id: Mapped[int] = mapped_column(
        ForeignKey("Users.user_id"), nullable=False
    )

    status: Mapped[invite_status] = mapped_column(nullable=False, default="open")
