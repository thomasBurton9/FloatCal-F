from fastapi import APIRouter, HTTPException

from db.queries.search_db import search_items
from db.queries.user_db import check_user_exists


router = APIRouter(prefix="/api")


@router.get("/{user_id}/search")
def search_items_api(user_id: int, query: str):
    if not check_user_exists(user_id):
        raise HTTPException(422, "User with specified user_id does not exist")
    if len(query.strip()) < 2:
        return []

    return search_items(user_id, query)
