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

export async function createCalendar(userId, calendarFields) {
  try {
    const createCalendarUrl =
      API_URL + "/" + String(userId) + "/create_calendar";
    const response = await fetch(createCalendarUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: calendarFields.name,
        colour: calendarFields.colour,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      console.error("Error creating calendar", data);
      return;
    }
    return data;
  } catch (error) {
    console.error("Error creating calendar: ", error);
  }
}

export async function addCalendarMember(calendarId, userId) {
  try {
    const addMemberUrl =
      API_URL + "/add_member/" + String(calendarId) + "/" + String(userId);
    const response = await fetch(addMemberUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (!response.ok) {
      console.error("Error adding calendar member", data);
      return;
    }
    return data;
  } catch (error) {
    console.error("Error adding calendar member: ", error);
  }
}

export async function removeCalendarMember(calendarId, userId) {
  try {
    const removeMemberUrl =
      API_URL + "/remove_member/" + String(calendarId) + "/" + String(userId);
    const response = await fetch(removeMemberUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (!response.ok) {
      console.error("Error removing calendar member", data);
      return;
    }
    return data;
  } catch (error) {
    console.error("Error removing calendar member: ", error);
  }
}
