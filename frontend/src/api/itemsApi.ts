import type { itemTypeType, updatesType } from "../types/calendarItems";
import { API_URL } from "../constants";
import { CompletionApiResult } from "../types/api/completionApi";
// Item type is either "task" or "event"
//
export async function updateItem(
  calendarId: number,
  itemId: number,
  itemType: itemTypeType,
  updates: updatesType,
): Promise<CompletionApiResult> {
  const apiItemType = itemType === "task" ? "tasks" : "events"; // Convert the name into the /items/ that the api requires

  try {
    const updateItemsUrl =
      API_URL +
      "/" +
      String(calendarId) +
      "/" +
      apiItemType +
      "/" +
      String(itemId);

    const response = await fetch(updateItemsUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Error updating item:", data);
      return { success: false, error: data.detail };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating item:", error);
    return {
      success: false,
    };
  }
}
