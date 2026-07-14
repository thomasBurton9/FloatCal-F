import { API_URL } from "../constants";

export async function fetchSettings(userId) {
  try {
    const getSettingsUrl = API_URL + "/" + String(userId) + "/settings";
    const response = await fetch(getSettingsUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Error fetching settings", data);
      return;
    }
    return data;
  } catch (error) {
    console.error("Error fetching settings:", error);
  }
}
