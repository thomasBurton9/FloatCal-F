export type CalendarDetailsScreenProps = {
  selectedCalendar: Calendar | null;
  setCurrentView: (view: currentView) => void;
  userId: number;
  setCalendars: (calendar: Calendar) => void;
};

export type InvitesScreenProps = {
  setCurrentView: (view: currentView) => void;
  userId: number;
  currentView: currentView;
};
export type currentView = "details" | "create" | "invites" | "list";
export type Calendar = any;

export type Invite = {
  invite_id: number;
  invite_from_user_id: number;
  invite_calendar_id: number;
  invite_to_user_id: number;
  status: InviteStatus;
};

export type InviteStatus = "open" | "accepted" | "declined";

export type InviteProps = {
  invite: Invite;
  reload: boolean;
  setReload: (value: boolean) => void;
};
