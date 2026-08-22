export type RecurrenceRule =
  "daily" | "weekly" | "fortnightly" | "monthly" | "yearly";

export type FixedEvent = {
  event_id: number;
  calendar_id: number;
  calendar_name: string;
  name: string;
  date: string;
  start_time: string;
  end_time: string;
  notes?: string;
  recurrence_rule?: RecurrenceRule | null;
  reminder: boolean;
};

export type FloatingTask = {
  task_id: number;
  calendar_id: number;
  calendar_name: string;
  name: string;
  date: string;
  duration_minutes: number;
  notes?: string;
  recurrence_rule?: RecurrenceRule | null;
  reminder: boolean;
  scheduled_start?: string | null;
  preferred_window?: string | null;
  manually_scheduled: boolean;
};

export type CalendarItem = FixedEvent | FloatingTask;

export type ItemInfoModalProps = {
  isVisible: boolean;
  item: CalendarItem | null;
  setSelectedItem: (selectedItem: CalendarItem | null) => void;
  setCurrentModal: (currentModal: string | null) => void;
  returnModal: string | null;
  setReturnModal: (returnModal: string | null) => void;
  editedPreset?: CalendarItem | null;
  onChangedData: () => void;
};

export type itemTypeType = "task" | "event";

export type updatesType = {
  name?: string;
  date?: string;
  notes?: string | null;
  recurrence_rule?: RecurrenceRule | null;
  reminder?: boolean;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  preferred_window?: string | null;
  scheduled_start?: string | null;
  manually_scheduled?: boolean;
};

export type itemEditDraft = CalendarItem; // Intentional currently as there is no need to make custom fields

export type itemEditFormProps = {
  item: CalendarItem;
  draft: CalendarItem;
  setDraft: (newItem: CalendarItem | null) => void;
};
