import { API_URL } from "../constants";
import { fetchCalendarIds } from "./calendarApi";
import { formatDate } from "../helpers/dateHelpers";
export async function fetchItems(userId, date) {
  const calendarIds = await fetchCalendarIds(userId);
  if (!calendarIds) {
    return [];
  }
  let items = [];
  for (const calendarId of calendarIds) {
    try {
      const getItemsUrl =
        API_URL +
        "/" +
        String(calendarId) +
        "/items?date=" +
        String(formatDate(date));
      const response = await fetch(getItemsUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("Error fetching items", data);
        continue;
      }
      // Concatenate 2 arrays together
      items = [...items, ...data]; // Data should be list[FloatingTask | FixedEvent]
    } catch (error) {
      console.error("Error fetching items: ", error);
    }
  }
  return items;
}
