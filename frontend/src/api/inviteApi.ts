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
      API_URL +
      "/respond_to_invite/" +
      String(userId) +
      "/" +
      String(inviteId) +
      "?accepted=" +
      String(accepted);

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

export async function checkInvitesToUser(userId: number) {
  try {
    const checkInvitesUrl = API_URL + "/" + String(userId) + "/invites_to_user";

    const response = await fetch(checkInvitesUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (!response.ok) {
      console.error("Error checking invites: ", data);
      return { success: false, error: data.detail };
    }

    // Check the return shape first TODO: Quick
    // Should be list[Invite]
    return { success: true, result: data };
  } catch (error) {
    console.error("Error checking invites: ", error);
    return {
      success: false,
    };
  }
}

export async function checkInvitesToUserInfo(userId: number) {
  try {
    const checkInvitesUrl =
      API_URL + "/" + String(userId) + "/invites_to_user_info";

    const response = await fetch(checkInvitesUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (!response.ok) {
      console.error("Error checking invites: ", data);
      return { success: false, error: data.detail };
    }

    // Should be list[InviteWithInfo]
    return { success: true, result: data };
  } catch (error) {
    console.error("Error checking invites: ", error);
    return {
      success: false,
    };
  }
}
