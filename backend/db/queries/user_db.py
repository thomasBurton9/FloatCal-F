from db.models.users import User
from sqlalchemy import select

from db.session import get_db


def check_user_exists(user_id: int):
    user_exists_statement = select(User.user_id).where(User.user_id == user_id)

    with get_db() as session:
        return session.execute(user_exists_statement).scalar() is not None
