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

export type Invite = any;
