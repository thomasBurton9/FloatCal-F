import { API_URL } from "../constants";
import { validateSettings } from "../helpers/validateSettings";

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

export async function updateSettings(userId, updates, setSettings) {
  if (!validateSettings(updates)) {
    return;
  }

  const { sleep_window, ...otherUpdates } = updates; // Split updates into 2 -> sleep_window is combined when submitting initially to prevent broken values
  // However it needs to be split apart once again

  // If buffer_minutes is to be converted to a Number it should be done here. Most likely not needed
  const requestUpdates = {
    ...otherUpdates,
    ...(sleep_window
      ? {
          sleep_start: sleep_window[0],
          sleep_end: sleep_window[1],
        }
      : {}),
  };

  try {
    const updateSettingsUrl =
      API_URL + "/" + String(userId) + "/update_setting";
    const response = await fetch(updateSettingsUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestUpdates),
    });
    const data = await response.json();
    if (!response.ok) {
      // Somehow inform user
      console.error("Error updating settings", data);
      return;
    }
  } catch (error) {
    console.error("Error: ", error);
    return;
  }

  const updatedSettings = await fetchSettings(userId);
  setSettings(updatedSettings);
}
