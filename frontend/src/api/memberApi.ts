import { API_URL } from "../constants";

export async function fetchCalendarMemberEntryInfo(calendarId: number) {
  try {
    const getMemberEntryInfoUrl =
      API_URL + "/" + String(calendarId) + "/member_entries_info";
    const response = await fetch(getMemberEntryInfoUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (!response.ok) {
      console.error("Error fetching calendar member entry info", data);
      return { success: false, error: data.detail };
    }
    return { success: true, result: data };
  } catch (error) {
    console.error("Error fetching calendar member entry info: ", error);
    return { success: false };
  }
}
