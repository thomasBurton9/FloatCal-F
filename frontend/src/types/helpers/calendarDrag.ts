import type { CalendarItem } from "../calendarItems";

type CalendarKitDateTime = {
  dateTime?: string;
};

export type CalendarKitDragEvent = {
  calendarItem?: CalendarItem;
  start?: CalendarKitDateTime;
  end?: CalendarKitDateTime;
};
