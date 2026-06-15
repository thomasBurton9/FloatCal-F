import datetime as dt


# There might be no point in these functions
# api/ could call db/queries/ directly
# For more complex functions it would make sense though
def get_items(calendar_id: int, date: dt.date):
    raise NotImplementedError
    # return calendar_db.list_items_for_calendar_date(calendar_id, date)
