import { extractTime, formatDate } from "./dateHelpers";
import type { CalendarItem } from "../types/calendarItems";
import type { CalendarKitDragEvent } from "../types/helpers/calendarDrag";

export function calendarItemFromDragEvent(
  event: CalendarKitDragEvent,
): CalendarItem | null {
  const item = event.calendarItem;
  const startDateTime = event.start?.dateTime;
  const endDateTime = event.end?.dateTime;

  if (!item || !startDateTime || !endDateTime) {
    return null;
  }

  const start = new Date(startDateTime);
  const end = new Date(endDateTime);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  ) {
    return null;
  }

  const date = formatDate(start);

  // The current item model stores one date for both sides of a fixed event.
  // overnight item's should not be created at this conversion boundary.
  if (formatDate(end) !== date) {
    return null;
  }

  // Floating Task
  if ("duration_minutes" in item) {
    return {
      ...item,
      date,
      scheduled_start: extractTime(start),
      manually_scheduled: true,
    };
  }

  // Fixed Event
  return {
    ...item,
    date,
    start_time: extractTime(start),
    end_time: extractTime(end),
  };
}
