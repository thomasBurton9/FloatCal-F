import { SchedulingErrorTask } from "./manageTasks";

export type ManuallyScheduleTaskProps = {
  task: SchedulingErrorTask;
  isVisible: boolean;
  setCurrentModal: (modal: string | null) => void;
  onItemAdded: () => void;
};
