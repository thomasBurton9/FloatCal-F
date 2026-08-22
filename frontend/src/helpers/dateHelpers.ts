import { weekdayLengthType } from "../types/helpers/dateHelpers";

// Formats date object into api receivable YYYY-MM-DD
export function formatDate(date: Date | string): string {
  if (!date) {
    console.error("No date provided");
    return formatDate(new Date());
  }
  if (typeof date === "string") {
    date = new Date(date);
  }
  const year: string = String(date.getFullYear());
  const month: string = String(date.getMonth() + 1).padStart(2, "0"); // months are 0 indexes i.e. jan = 0
  const day: string = String(date.getDate()).padStart(2, "0");

  const finalDate: string = `${year}-${month}-${day}`;
  return finalDate;
}
// HH:MM:SS -> Date object
export function timeStringToDate(time: string): Date {
  // Does not validate whether time string is in the correct format
  const hours = parseInt(time.slice(0, 2));
  const minutes = parseInt(time.slice(3, 5));

  let date: Date = new Date();
  date.setHours(hours, minutes);

  return date;
}

// Date object -> Formatted time HH:MM
export function extractTime(inputDate: Date | string): string {
  const date = new Date(inputDate);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function addMinutesToDateTime(
  dateString: string,
  timeString: string,
  minutes: string | number,
): string {
  const newDateTime: Date = new Date(`${dateString}T${timeString}`);
  let duration: number;
  if (typeof minutes === "string") {
    duration = parseInt(minutes);
  } else {
    duration = minutes;
  }

  newDateTime.setMinutes(newDateTime.getMinutes() + duration); // Automatically rolls the hour over in case it does go over

  const newHours: string = String(newDateTime.getHours()).padStart(2, "0");
  const newMinutes: string = String(newDateTime.getMinutes()).padStart(2, "0"); // 'minutes' has already been declared??
  return `${formatDate(newDateTime)}T${newHours}:${newMinutes}:00`;
}

// Inputs YYYY-MM-DD , outputs Day, Mon DD, YYYY
export function formatDateUser(
  date: string,
  weekdayLength: weekdayLengthType = "long",
): string {
  const [year, month, day] = date.split("-").map(Number);
  const parsedDate = new Date(year, month - 1, day);
  const weekday = parsedDate.toLocaleDateString("en-US", {
    weekday: weekdayLength,
  });
  const monthName = parsedDate.toLocaleDateString("en-US", { month: "short" }); // i.e. Jan instead of January

  return `${weekday}, ${monthName} ${String(day).padStart(2, "0")}, ${year}`;
}

// Date time object -> HH:MM
export function formatTime(time: Date) {
  return time.toTimeString().slice(0, 5);
}
