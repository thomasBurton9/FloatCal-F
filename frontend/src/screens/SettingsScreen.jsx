import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { API_URL } from "../constants";

export default function SettingsScreen({ userId, setUserId }) {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    // Defining function inside useEffect to prevent cascading renders??
    // Dictated by linter

    async function loadSettings() {
      const settingsData = await fetchSettings(userId);
      if (settingsData) {
        console.log("Settings", settingsData);
        setSettings(settingsData);
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
            <Text style={style.individualSettingInfo}>
              Sleep Window:{" "}
              {settings
                ? formatTime(settings["sleep_start"]) +
                  "-" +
                  formatTime(settings["sleep_end"])
                : "Loading..."}
            </Text>
            <Pressable style={style.editSettingsButton}>
              <Text>{">"}</Text>
            </Pressable>
          </View>
          <View style={style.individualSetting}>
            <Text style={style.individualSettingInfo}>
              Buffer Time:{" "}
              {settings ? settings["buffer_minutes"] + "min" : "Loading..."}
            </Text>
            <Pressable style={style.editSettingsButton}>
              <Text>{">"}</Text>
            </Pressable>
          </View>
          <View style={style.individualSetting}>
            <Text style={style.individualSettingInfo}>
              Preferred Times:{" "}
              {settings
                ? formatSchedulingWindows(settings["scheduling_windows"])
                : "Loading..."}
            </Text>
            <Pressable style={style.editSettingsButton}>
              <Text>{">"}</Text>
            </Pressable>
          </View>
        </View>
        <View style={style.settingsSection}>
          <Text>Notifications</Text>
          {/* Use react native - Switch for this */}
          <View style={style.individualSetting}>
            <Text style={style.individualSettingInfo}>
              Notifications:{" "}
              {settings
                ? String(settings["notifications_enabled"])
                : "Loading..."}
            </Text>

            <Pressable style={style.editSettingsButton}>
              <Text>{">"}</Text>
            </Pressable>
          </View>
          <View style={style.individualSetting}>
            <Text style={style.individualSettingInfo}>
              Sound: {settings ? settings["notification_sound"] : "Loading..."}
            </Text>
            <Pressable style={style.editSettingsButton}>
              <Text>{">"}</Text>
            </Pressable>
          </View>
        </View>
        <View style={style.settingsSection}>
          <Text>Account</Text>
          <Pressable onPress={() => setUserId(false)}>
            <Text>Logout</Text>
          </Pressable>
        </View>
      </View>
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

function formatSchedulingWindows(scheduling_windows) {
  if (!scheduling_windows) {
    return "No windows configured";
  }

  // Inform user if they have multiple scheduling windows
  if (Object.keys(scheduling_windows).length > 1) {
    return `${Object.keys(scheduling_windows)[0]} ...`;
  }
  return Object.keys(scheduling_windows)[0];
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
  individualSettingInfo: {
    paddingLeft: 10,
  },
  individualSetting: {
    justifyContent: "space-between", // Push button/arrow to the far right
    flexDirection: "row",
    alignItems: "center",
    minWidth: "75%",
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 5,
    marginVertical: 10,
  },
  editSettingsButton: {
    padding: 10,
  },
});
