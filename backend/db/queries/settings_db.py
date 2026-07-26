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

        # Pydantic converts scheduling-window values to datetime.time objects
        # the database column is JSON and must contain strings.
        scheduling_windows = updates.get("scheduling_windows")
        if (
            scheduling_windows is not None
        ):  # updates don't have to contain all fields so a check is necessary
            updates["scheduling_windows"] = {
                name: [
                    start.isoformat(),
                    end.isoformat(),
                ]  # converts object into iso string
                for name, (
                    start,
                    end,
                ) in scheduling_windows.items()  # using dictionary comprehension instead of a full loop for shorter code
            }

        for field, value in updates.items():
            setattr(old_settings, field, value)

        session.commit()


def get_settings(user_id: int) -> Setting:
    get_settings_statement = select(Setting).where(Setting.user_id == user_id)

    with get_db() as session:
        settings = session.execute(get_settings_statement).scalar()
        if not settings:
            raise ValueError("Error: No settings table")
        return settings
