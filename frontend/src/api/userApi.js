import { API_URL } from "../constants";

export async function fetchUserInfo(userId) {
  try {
    const getUserInfoUrl =
      API_URL + "/authentication" + "/" + String(userId) + "/user_info";
    const response = await fetch(getUserInfoUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (!response.ok) {
      console.error("Error fetching user info", data);
      return;
    }
    return data;
  } catch (error) {
    console.error("Error fetching user info: ", error);
  }
}

export async function listUsers() {
  try {
    const listUsersUrl = API_URL + "/list_users";
    const response = await fetch(listUsersUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (!response.ok) {
      console.error("Error fetching user info", data);
      return { success: false, error: data.detail };
    }
    return { success: true, result: data };
  } catch (error) {
    console.error("Error fetching user info: ", error);
    return { success: false };
  }
}
