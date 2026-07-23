import { API_URL } from "../constants";
import { fetchCalendarIds } from "./calendarApi";
import { formatDate } from "../helpers/dateHelpers";

// Similar function used in SettingsScreen.jsx
function formatTime(time) {
  return time.toTimeString().slice(0, 5);
}

export async function createFloatingTask(calendarId, itemFields) {
  try {
    const createTaskUrl = API_URL + "/" + String(calendarId) + "/tasks";
    const response = await fetch(createTaskUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: itemFields.name,
        date: formatDate(itemFields.date),
        duration_minutes: Number(itemFields.duration),
        notes: itemFields.notes || null,
        recurrence_rule: itemFields.recurrenceOn
          ? itemFields.recurrenceRule
          : null,
        reminder: itemFields.remindersOn,
        preferred_window: itemFields.preferredWindow || null,
        scheduled_start: null,
        manually_scheduled: false,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Error creating floating task", data);
      return;
    }
    return data;
  } catch (error) {
    console.error("Error creating floating task:", error);
  }
}

export async function createFixedEvent(calendarId, itemFields) {
  try {
    const createEventUrl = API_URL + "/" + String(calendarId) + "/events";
    const response = await fetch(createEventUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: itemFields.name,
        date: formatDate(itemFields.date),
        notes: itemFields.notes || null,
        recurrence_rule: itemFields.recurrenceOn
          ? itemFields.recurrenceRule
          : null,
        reminder: itemFields.remindersOn,
        start_time: formatTime(itemFields.startTime),
        end_time: formatTime(itemFields.endTime),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Error creating fixed event", data);
      return;
    }
    return data;
  } catch (error) {
    console.error("Error creating fixed event:", error);
  }
}

export async function fetchTasksInRange(userId, startDate, endDate) {
  const calendarIds = await fetchCalendarIds(userId);
  if (!calendarIds) {
    return {};
  }

  try {
    const getItemsUrl =
      API_URL +
      "/" +
      String(userId) +
      "/get_tasks_bulk_user" +
      "?start_date=" +
      String(formatDate(startDate)) +
      "&end_date=" +
      String(formatDate(endDate));

    const response = await fetch(getItemsUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Error fetching tasks", data);
      return {}; // Return non undefined value to prevent crashes in functions assuming a value is returned
    }
    return data;
  } catch (error) {
    console.error("Error fetching tasks: ", error);
    return {};
  }
}

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
        console.error("Error fetching items: ", data);
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
