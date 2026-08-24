# IMPORTANT NOTE
# This was initially added as a way to use OOP principles in this project
# This project is not very well suited to these principles, so these classes remain undefined
# They provide some evidence of OOP including inheritance and classes
# There is other evidence of OOP in backend/db/models/


class User:
    def __init__(self, user_id: int, email: str, password_hash: str, display_name: str):

        self.user_id: int = user_id
        self.email: str = email
        self.password_hash: str = password_hash
        self.display_name: str = display_name

    def get_calendars(self) -> list:
        raise NotImplementedError

    def create_calendar(self, name: str, colour: str):
        raise NotImplementedError

    def update_settings(self, new_settings: dict):
        raise NotImplementedError

    def get_settings(self) -> dict | None:
        raise NotImplementedError
