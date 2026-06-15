from fastapi import APIRouter
import datetime as dt
from db.queries.calendar_db import list_items_for_calendar_date

router = APIRouter(prefix="/api")


@router.get("/{calendar_id}/items")
def get_calendar_items(calendar_id: int, date: dt.date):
    return list_items_for_calendar_date(calendar_id, date)
