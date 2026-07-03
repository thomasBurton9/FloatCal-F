import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { API_URL } from "../constants";

export default function SettingsScreen({ userId, setUserId }) {
  const [settings, setSettings] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Defining function inside useEffect to prevent cascading renders??
    // Dictated by linter

    async function loadSettings() {
      const settingsData = await fetchSettings(userId);
      if (settingsData) {
        console.log("Settings", settingsData);
        setSettings(settingsData);
        setLoaded(true);
      }
    }
    loadSettings();
  }, [userId]); // Only run when userId changes and not when
  // settings changes to prevent cascading renders
  return (
    <>
      <View style={style.screen}>
        <View>
          <Text>Settings</Text>
        </View>
        <View style={style.settingsSection}>
          <Text>Scheduler</Text>
          <View style={style.individualSetting}>
            <Text>
              Sleep Window:{" "}
              {loaded
                ? formatTime(settings["sleep_start"]) +
                  "-" +
                  formatTime(settings["sleep_end"])
                : null}
            </Text>
            <Pressable style={style.editSettingsButton}>
              <Text>{">"}</Text>
            </Pressable>
          </View>
        </View>
        <View style={style.settingsSection}>
          <Text>Notifications</Text>
        </View>
        <View style={style.settingsSection}>
          <Text>Account</Text>
          <Pressable onPress={() => setUserId(false)}>
            <Text>Logout</Text>
          </Pressable>
        </View>
      </View>
      <Text>{userId}</Text>
    </>
  );
}

async function fetchSettings(userId) {
  let data;
  try {
    const getSettingsUrl = API_URL + "/" + String(userId) + "/settings";
    const response = await fetch(getSettingsUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    data = await response.json();
    if (!response.ok) {
      console.error("Error fetching settings", data);
      return;
    }
    return data;
  } catch (error) {
    console.error("Error fetching settings:", error);
  }
}

// Format time returned from api into more readable time
// i.e. 23:00:00 -> 23:000

function formatTime(time) {
  return time.slice(0, 5);
}
const style = StyleSheet.create({
  screen: {
    alignItems: "center",
    justifyContent: "center",
  },
  settingsSection: {
    flexDirection: "column",
    alignItems: "center",
  },
  individualSetting: {
    flexDirection: "row",
    alignItems: "center",
  },
  editSettingsButton: {
    padding: 10,
  },
});
