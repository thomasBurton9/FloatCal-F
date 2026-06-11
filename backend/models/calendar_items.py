import datetime as dt


class CalendarItem:
    def __init__(
        self,
        item_id: int,
        calendar_id: int,
        name: str,
        date: dt.date,
        notes: str,
        recurrence_rule: str,
        reminder: bool,
    ):

        self.item_id: int = item_id
        self.calendar_id: int = calendar_id
        self.name: str = name
        self.date: dt.date = date
        self.notes: str = notes
        self.recurrence_rule: str = recurrence_rule
        self.reminder: bool = reminder

    def get_info(self) -> dict:
        raise NotImplementedError

    def get_calendar(self) -> int:
        raise NotImplementedError

    def is_recurring(self) -> bool:
        raise NotImplementedError

    def get_reminders(self) -> dict | None:
        raise NotImplementedError

    def update(self, new_details: dict):
        raise NotImplementedError

    def delete(self):
        raise NotImplementedError


class FixedEvent(CalendarItem):
    # Possibly use multiday time -
    def __init__(
        self,
        item_id: int,
        calendar_id: int,
        name: str,
        date: dt.date,
        notes: str,
        recurrence_rule: str,
        reminder: bool,
        start_time: dt.time,
        end_time: dt.time,
    ):
        super().__init__(
            item_id, calendar_id, name, date, notes, recurrence_rule, reminder
        )

        self.start_time: dt.time = start_time
        self.end_time: dt.time = end_time

    def get_duration(self) -> int:
        raise NotImplementedError

    # This method might not be required - could be deleted later
    def conflicts_with(self, start_time: dt.time, end_time: dt.time) -> bool:
        raise NotImplementedError


class FloatingTask(CalendarItem):
    def __init__(
        self,
        item_id: int,
        calendar_id: int,
        name: str,
        date: dt.date,
        notes: str,
        recurrence_rule: str,
        reminder: bool,
        duration_minutes: int,
        preferred_window: str,
        scheduled_start: dt.time | None,
        manually_scheduled: bool,
    ):
        super().__init__(
            item_id, calendar_id, name, date, notes, recurrence_rule, reminder
        )

        self.duration_minutes: int = duration_minutes
        self.preferred_window: str = preferred_window
        self.scheduled_start: dt.time | None = scheduled_start
        self.manually_scheduled: bool = manually_scheduled

    def is_scheduled(self) -> bool:
        raise NotImplementedError

    def get_scheduled_end(self) -> dt.time | None:
        raise NotImplementedError

    def mark_complete(self, on_date: dt.date | None = None):
        raise NotImplementedError

    def is_complete_on(self, on_date: dt.date | None = None) -> bool:
        raise NotImplementedError

    def manually_reschedule(self, new_start_time: dt.time):
        raise NotImplementedError

    def automatically_schedule(self, new_start_time: dt.time):
        raise NotImplementedError
