import { FloatingTask } from "./calendarItems";

export type ManageTaskProps = {
  isVisible: boolean;
  setCurrentModal: (currentModal: string | null) => void;
  userId: number;
  onItemPress: (task: FloatingTask) => void;
  setReturnModal: (modal: string) => void;
};

export type TaskType = "Scheduled" | "Unscheduled" | "Completed";

export type Task = {
  task_id: number;
  calendar_id: number;
  name: string;
  date: string;
  duration_minutes: number;
  notes?: string;
  recurrence_rule?: string;
  reminder: boolean;
  preferred_window?: string;
  scheduled_start?: string; // Though it stores time, it does not use date but time. This might need to be changed
  manually_scheduled: boolean;
  completed: boolean;
};

export type OrganizedTasks = Record<string, Task[]>; // Potentially change string to date??
export type Calendar = {
  calendar_id: number;
  name: string;
  colour: string;
  created_by_user_id: number;
};

export type TaskTypeSwitcherProps = {
  taskType: TaskType;
  setTaskType: (taskType: TaskType) => void;
};

export type ScheduledTaskListProps = {
  scheduledTasks: OrganizedTasks;
  calendars: Calendar[];
  onTaskPress: (task: Task) => void;
};
export type UnscheduledTaskListProps = {
  unscheduledTasks: OrganizedTasks;
  calendars: Calendar[];
  onTaskPress: (task: Task) => void;
};

export type TaskOnDateProps = {
  date: string;
  tasks: Task[];
  onReorder: (tasks: Task[]) => void;
  onTaskPress: (task: Task) => void;
};
export type IndividualTaskRowProps = {
  task: Task;
  drag: () => void;
  onTaskPress: (task: Task) => void;
};

export type SchedulingErrorProps = {
  isVisible: boolean;
  setCurrentModal: (taskName: string | null) => void;
  setPage: (pageName: string) => void;
  task: SchedulingErrorTask | null;
};

export type SchedulingErrorTask = {
  taskId: number;
  calendarId: number;
  name: string;
  durationMinutes: number;
};
