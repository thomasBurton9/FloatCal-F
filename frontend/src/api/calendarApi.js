import { API_URL } from "../constants";

export async function fetchCalendars(userId) {
  try {
    const getCalendarsUrl = API_URL + "/" + String(userId) + "/calendars";
    const response = await fetch(getCalendarsUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (!response.ok) {
      console.error("Error fetching calendars", data);
      return [];
    }
    return data;
  } catch (error) {
    console.error("Error fetching calendars: ", error);
    return []; // Prevent further error when another function assumes a result
  }
}

export async function fetchCalendarIds(userId) {
  try {
    const getItemsUrl = API_URL + "/" + String(userId) + "/calendar_ids";
    const response = await fetch(getItemsUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (!response.ok) {
      console.error("Error fetching calendar ids", data);
      return;
    }
    return data;
  } catch (error) {
    console.error("Error fetching calendar ids", error);
  }
}
