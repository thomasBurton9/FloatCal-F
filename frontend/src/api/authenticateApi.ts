import { API_URL } from "../constants";

export async function deleteUser(
  userId: number,
  email: string,
  password: string,
) {
  try {
    const deleteUserUrl =
      API_URL + "/authentication/" + String(userId) + "/delete_user";
    const response = await fetch(deleteUserUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      console.error("Error deleting user", data);
      // Return a nice object to make validation of success easier and more consistent.
      // Prevents other functions from having to guess
      return { success: false, error: data.detail };
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting user: ", error);
    return { success: false };
  }
}
