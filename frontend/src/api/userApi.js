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
