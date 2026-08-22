import { API_URL } from "../constants";

export async function searchItems(
  userId: number,
  query: string,
  currentOnly: boolean = false,
) {
  try {
    const searchItemsUrl =
      API_URL +
      "/" +
      String(userId) +
      "/search?query=" +
      String(query) +
      "&current_only=" +
      String(currentOnly);

    const response = await fetch(searchItemsUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (!response.ok) {
      console.error("Error searching items: ", data);
      return { success: false, error: data.detail };
    }

    return { success: true, result: data };
  } catch (error) {
    console.error("Error searching items: ", error);
    return {
      success: false,
    };
  }
}
