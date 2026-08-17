import { API_URL } from "../constants";

export async function inviteUser(
  userId: number,
  userToInviteId: number,
  calendarId: number,
) {
  try {
    const inviteUserURL =
      API_URL +
      "/invite_user/" +
      String(userId) +
      "/" +
      String(userToInviteId) +
      "/" +
      String(calendarId);

    const response = await fetch(inviteUserURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (!response.ok) {
      console.error("Error inviting user: ", data);
      return { success: false, error: data.detail };
    }

    return { success: true };
  } catch (error) {
    console.error("Error inviting user:", error);
    return {
      success: false,
    };
  }
}
