from typing import Any

from sqlalchemy import select

from db.models.settings import Setting
from db.session import get_db
from schemas.settings_schemas import UpdateSettings


def update_settings(user_id: int, data: UpdateSettings):
    get_current_settings_statement = select(Setting).where(Setting.user_id == user_id)

    with get_db() as session:
        old_settings: Setting | None = session.execute(
            get_current_settings_statement
        ).scalar()

        # Under normal operation this should not happen ever.
        # Setting should be created when a user is created
        # Maybe just call a function to create the settings here
        if old_settings is None:
            raise ValueError("Error: No settings table")

        updates: dict[str, Any] = data.model_dump(exclude_unset=True)

        for field, value in updates.items():
            setattr(old_settings, field, value)

        session.commit()
