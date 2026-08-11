import { Alert } from "react-native";
import type { SettingsUpdate, SleepWindow } from "../types/settings";

const MIN_BUFFER_MINUTES = 1;
const MAX_BUFFER_MINUTES = 1440;

export function validateSettings(updates: SettingsUpdate): boolean {
  console.log(updates);

  if ("sleep_window" in updates) {
    const sleepWindow: SleepWindow | undefined = updates.sleep_window;
    const sleepStart: string | undefined = sleepWindow?.[0]; // Use syntax (?.[]) that allows undefined when the sleep window does not exist for some reason
    const sleepEnd: string | undefined = sleepWindow?.[1];
    const sleepStartMinutes = timeToMinutes(sleepStart);
    const sleepEndMinutes = timeToMinutes(sleepEnd);

    if (sleepStartMinutes === null || sleepEndMinutes === null) {
      // Potentially this is not necessary given the previous type check / time picker prevent this
      Alert.alert("The sleep times must be valid times");
      return false;
    }

    // Sleep windows can cross midnight.
    // So that is not checked
    // Sleep window cannot be 24h due to breaking scheduling entirely
    // Potentially limit sleep to like 16h TODO: Decide whether this is necessary
    if (sleepStartMinutes === sleepEndMinutes) {
      Alert.alert("The sleep window cannot cover the whole day");
      return false;
    }
  }

  if ("buffer_minutes" in updates) {
    const bufferValue = updates.buffer_minutes;
    // If buffer minutes is a string (it should be with the current code)
    // First check if the value is a string and it is empty or only whitespace, before converting it into a number
    const bufferMinutes =
      typeof bufferValue === "string" && bufferValue.trim() === ""
        ? NaN
        : Number(bufferValue);

    // This currently is scoped around all invalid inputs including blank, whitespace or just invalid number
    // Number() returns NaN if the input is not a number
    if (!Number.isInteger(bufferMinutes)) {
      Alert.alert(
        "The buffer time must be a valid number above 0 and less than 1440",
      );
      return false;
    }

    if (bufferMinutes < MIN_BUFFER_MINUTES) {
      Alert.alert("The buffer time must be at least 1 minute in length");
      return false;
    }

    if (bufferMinutes >= MAX_BUFFER_MINUTES) {
      Alert.alert("The buffer time must be below 1440 minutes in length");
      return false;
    }
  }

  if ("scheduling_windows" in updates) {
    const schedulingWindows = updates.scheduling_windows;

    // Currently if a previous preferred window was saved with invalid format somehow, this will always error
    // Loop through all scheduling windows and validate them individually
    if (schedulingWindows) {
      for (const [, [start, end]] of Object.entries(schedulingWindows)) {
        const startMinutes = timeToMinutes(start);
        const endMinutes = timeToMinutes(end);

        if (startMinutes === null || endMinutes === null) {
          Alert.alert("The preferred time must contain valid times");
          return false;
        }

        if (endMinutes <= startMinutes) {
          Alert.alert(
            "The end of a preferred time must be at least 1 minute after the start",
          );
          return false;
        }
      }
    }
  }

  return true; // Currently this happens automatically for notifications being enabled.
}

// Assumes time is HH:MM -> Possibly a duplicate of a function in dateHelpers
function timeToMinutes(time: string | undefined): number | null {
  if (!time) {
    return null;
  }
  // TODO: Add either regex or similar checking for format -> Make sure time format is correct.
  const [hours, minutes] = time.split(":");
  return Number(hours) * 60 + Number(minutes);
}
