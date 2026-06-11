import datetime as dt


class Calendar:
    def __init__(
        self, calendar_id: int, name: str, colour: str, created_by_user_id: int
    ):

        self.calendar_id: int = calendar_id
        self.name: str = name
        self.colour: str = colour
        self.created_by_user_id: int = created_by_user_id

    def get_items(self, date: dt.date) -> dict | None:
        raise NotImplementedError

    def add_item(self, calendar_item: dict):
        raise NotImplementedError

    def remove_item(self, item_id: int, item_type: str):
        raise NotImplementedError

    def add_member(self, user_id: int):
        raise NotImplementedError

    def remove_member(self, user_id: int):
        raise NotImplementedError

    # Potentially make this function itself search the settings
    # and pass user_id instead
    def get_free_gaps(self, date: dt.date, settings: dict) -> list[tuple]:
        raise NotImplementedError

    def schedule_floating_task(self, task_id: int, settings: dict):
        raise NotImplementedError
