import { API_URL } from "../constants";
import { formatDate } from "../helpers/dateHelpers";
import type { CompletionApiResult } from "../types/api/completionApi";

// Maybe combine the 2 functions into one here -> Future TODO:
export async function markTaskComplete(
  taskId: number,
  date: Date | string,
): Promise<CompletionApiResult> {
  try {
    const markTaskCompleteUrl =
      API_URL +
      "/" +
      String(taskId) +
      "/mark_complete?date=" +
      String(formatDate(date));
    const response = await fetch(markTaskCompleteUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (!response.ok) {
      console.error("Error marking task complete", data);
      // Return a nice object to make validation of success easier and more consistent.
      // Prevents other functions from having to guess
      return { success: false, error: data.detail };
    }
    return { success: true };
  } catch (error) {
    console.error("Error marking task complete: ", error);
    return { success: false };
  }
}

export async function markTaskIncomplete(
  taskId: number,
  date: Date | string,
): Promise<CompletionApiResult> {
  try {
    const markTaskIncompleteUrl =
      API_URL +
      "/" +
      String(taskId) +
      "/mark_incomplete?date=" +
      String(formatDate(date));
    const response = await fetch(markTaskIncompleteUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (!response.ok) {
      console.error("Error marking task incomplete", data);
      return { success: false, error: data.detail };
      // Using explicit return types here/now for better consistency, easier coding and avoidance of errors/confusion
      // As compared to previous js code without it
    }
    return { success: true };
  } catch (error) {
    console.error("Error marking task incomplete: ", error);
    return { success: false };
  }
}
