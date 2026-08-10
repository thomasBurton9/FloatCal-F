export type SchedulingWindows = Record<string, [string, string]>;

export type SleepWindow = [string, string];

export type SettingsUpdate = {
  // Every field is not required, -> use of '?''s
  sleep_window?: SleepWindow;
  // The buffer can be a string while it is being edited in the textinput.
  // It could then be converted to a number before submitting it to api -> this is not necessary though
  // TODO: Decide whether the number type is necessary
  buffer_minutes?: number | string;
  notifications_enabled?: boolean;
  notification_sound?: string;
  scheduling_windows?: SchedulingWindows | null;
};
