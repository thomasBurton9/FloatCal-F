export type CalendarDetailsScreenProps = {
  selectedCalendar: Calendar | null;
  setCurrentView: (view: currentView) => void;
  userId: number;
  setCalendars: (calendar: Calendar) => void;
  reloadCalendars: boolean;
  setReloadCalendars: (value: boolean) => void;
};

export type InvitesScreenProps = {
  setCurrentView: (view: currentView) => void;
  userId: number;
  currentView: currentView;
  reloadCalendars: boolean;
  setReloadCalendars: (value: boolean) => void;
};
export type currentView = "details" | "create" | "invites" | "list";
export type Calendar = any; // name, calendar_id, colour, created_by_user_id

export type Invite = {
  invite_id: number;
  invite_from_user_id: number;
  invite_calendar_id: number;
  invite_to_user_id: number;
  status: InviteStatus;
};

export type InvitePopulated = {
  invite_id: number;
  invite_from_user_id: number;
  invite_calendar_id: number;
  invite_to_user_id: number;
  status: InviteStatus;
  calendar_name: string;
  inviter_display_name: string;
};

export type InviteStatus = "open" | "accepted" | "declined";

export type InviteProps = {
  invite: InvitePopulated;
  reload: boolean;
  setReload: (value: boolean) => void;
  reloadCalendars: boolean;
  setReloadCalendars: (value: boolean) => void;
};
