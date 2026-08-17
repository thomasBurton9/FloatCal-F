import { API_URL } from "../constants";

export async function inviteUser(
  userId: number,
  userToInviteId: number,
  calendarId: number,
) {
  try {
    const inviteUserUrl =
      API_URL +
      "/invite_user/" +
      String(userId) +
      "/" +
      String(userToInviteId) +
      "/" +
      String(calendarId);

    const response = await fetch(inviteUserUrl, {
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

export async function respondToInvite(
  userId: number,
  inviteId: number,
  accepted: boolean,
) {
  try {
    const respondToInviteUrl =
      API_URL + "/respond_to_invite/" + String(userId) + "/" + String(inviteId);

    const response = await fetch(respondToInviteUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accepted: accepted,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      console.error("Error responding to invite: ", data);
      return { success: false, error: data.detail };
    }

    return { success: true };
  } catch (error) {
    console.error("Error responding to invite", error);
    return {
      success: false,
    };
  }
}
