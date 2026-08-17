export type CalendarDetailsScreenProps = {
  selectedCalendar: Calendar | null;
  setCurrentView: (view: currentView) => void;
  userId: number;
  setCalendars: (calendar: Calendar) => void;
};

export type currentView = "details" | "create" | "invites" | "list";
export type Calendar = any;
