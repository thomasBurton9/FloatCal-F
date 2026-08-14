
def invite_user_to_calendar(user_invite_from_id: int, user_to_invite_id, calendar_id: int) -> int:
    raise NotImplementedError

def respond_to_invite(user_id: int, invite_id: int, accepted: bool):
    raise NotImplementedError
    
def get_invites_to_user(user_id: int) -> list[Invite]:   
    raise NotImplementedError

# potentially not needed by frontend
def get_invites_from_user(user_id: int) -> list[Invite]:
    raise NotImplementedError

# user id required to make sure only the owner can request the id

def get_invites_for_calendar(user_id: int, calendar_id: int) -> list[Invite]:
    raise NotImplementedError