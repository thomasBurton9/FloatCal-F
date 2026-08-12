export type FixedEvent = {
  event_id: number;
  calendar_id: number;
  calendar_name: string;
  name: string;
  date: string;
  start_time: string;
  end_time: string;
  notes?: string;
  recurrence_rule?: string;
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
  recurrence_rule?: string;
  reminder: boolean;
  scheduled_start?: string;
};

export type CalendarItem = FixedEvent | FloatingTask;

export type ItemInfoModalProps = {
  isVisible: boolean;
  item: CalendarItem | null;
  setCurrentModal: (currentModal: string | null) => void;
  returnModal: string | null;
  setReturnModal: (returnModal: string | null) => void;
};
