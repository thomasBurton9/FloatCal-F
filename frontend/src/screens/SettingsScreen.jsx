import { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Pressable,
  Switch,
  TextInput,
} from "react-native";
import { API_URL } from "../constants";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function SettingsScreen({ userId, setUserId }) {
  const [settings, setSettings] = useState(null);
  const [editingKey, setEditingKey] = useState(null); // Which setting is the user currently editing

  const [sleepStart, setSleepStart] = useState(null);
  const [sleepEnd, setSleepEnd] = useState(null);
  const [bufferMinutes, setBufferMinutes] = useState(null);

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
            <View style={style.individualSettingRow}>
              <Text style={style.individualSettingInfo}>
                Sleep Window:{" "}
                {settings
                  ? formatTime(settings["sleep_start"]) +
                    "-" +
                    formatTime(settings["sleep_end"])
                  : "Loading..."}
              </Text>
              <Pressable
                disabled={settings ? false : true}
                onPress={() => {
                  if (editingKey !== "SleepWindow") {
                    // Make sure that the sleep values get loaded
                    setSleepStart(settings["sleep_start"]);
                    setSleepEnd(settings["sleep_end"]);
                  }
                  toggleDropdown("SleepWindow", editingKey, setEditingKey);
                }}
                style={style.editSettingsButton}
              >
                <Text>{editingKey !== "SleepWindow" ? ">" : "V"}</Text>
              </Pressable>
            </View>
            {editingKey === "SleepWindow" ? (
              <View style={style.editSettingsDialog}>
                <View style={style.editSleepSettings}>
                  <View style={style.sleepTimePicker}>
                    <Text>Sleep Start</Text>
                    <DateTimePicker
                      onChange={(_, time) => {
                        if (!time) {
                          return;
                        }
                        // Make sure the saved time is in an appropriate format
                        const hours = String(time.getHours()).padStart(2, "0");
                        const minutes = String(time.getMinutes()).padStart(
                          2,
                          "0",
                        );
                        // Format inline with what the backend returns
                        setSleepStart(`${hours}:${minutes}:00`);
                      }}
                      mode={"time"}
                      is24Hour={true}
                      value={timeStringToDate(sleepStart)}
                    ></DateTimePicker>
                  </View>
                  <View style={style.sleepTimePicker}>
                    <Text>Sleep End</Text>
                    <DateTimePicker
                      onChange={(_, time) => {
                        if (!time) {
                          return;
                        }
                        // Make sure the saved time is in an appropriate format
                        const hours = String(time.getHours()).padStart(2, "0");
                        const minutes = String(time.getMinutes()).padStart(
                          2,
                          "0",
                        );
                        // Format inline with what the backend returns
                        setSleepEnd(`${hours}:${minutes}:00`);
                      }}
                      mode={"time"}
                      is24Hour={true}
                      value={timeStringToDate(sleepEnd)}
                    ></DateTimePicker>
                  </View>
                </View>
                <EditSettingsActions
                  onCancel={() => {
                    setEditingKey(null);
                    setSleepStart(settings["sleep_start"]);
                    setSleepEnd(settings["sleep_end"]);
                  }}
                  onSave={() => {
                    // TODO: Combine these into 1 function call
                    updateSettings(
                      userId,
                      "sleep_start",
                      sleepStart,
                      setSettings,
                    );
                    updateSettings(userId, "sleep_end", sleepEnd, setSettings);
                  }}
                ></EditSettingsActions>
              </View>
            ) : null}
          </View>
          <View style={style.individualSetting}>
            <View style={style.individualSettingRow}>
              <Text style={style.individualSettingInfo}>
                Buffer Time:{" "}
                {settings ? settings["buffer_minutes"] + "min" : "Loading..."}
              </Text>
              <Pressable
                // Prevent editing when no value is loaded from the server
                // Prevents error when attempting to access attributes of null
                disabled={settings ? false : true}
                onPress={() => {
                  if (editingKey !== "BufferMinutes") {
                    // Make sure that the bufferminutes value is loaded
                    setBufferMinutes(settings["buffer_minutes"]);
                    console.log(settings["buffer_minutes"]);
                  }
                  toggleDropdown("BufferMinutes", editingKey, setEditingKey);
                }}
                style={style.editSettingsButton}
              >
                <Text>{editingKey !== "BufferMinutes" ? ">" : "V"}</Text>
              </Pressable>
            </View>
            {editingKey === "BufferMinutes" ? (
              <View style={style.editSettingsDialog}>
                <TextInput
                  // TextInput only accepts string -> it does not accept numbers
                  value={String(bufferMinutes)}
                  inputMode={"numeric"}
                  onChangeText={(e) => setBufferMinutes(e)}
                ></TextInput>
                <EditSettingsActions
                  onCancel={() => {
                    setEditingKey(null);
                    setBufferMinutes(settings["buffer_minutes"]);
                  }}
                  onSave={() => {
                    updateSettings(
                      userId,
                      "buffer_minutes",
                      Number(bufferMinutes),
                      setSettings,
                    );
                  }}
                ></EditSettingsActions>
              </View>
            ) : null}
          </View>
          <View style={style.individualSetting}>
            <View style={style.individualSettingRow}>
              <Text style={style.individualSettingInfo}>
                Preferred Times:{" "}
                {settings
                  ? formatSchedulingWindows(settings["scheduling_windows"])
                  : "Loading..."}
              </Text>
              <Pressable
                onPress={() =>
                  toggleDropdown("SchedulingWindows", editingKey, setEditingKey)
                }
                style={style.editSettingsButton}
              >
                <Text>{editingKey !== "SchedulingWindows" ? ">" : "V"}</Text>
              </Pressable>
            </View>
            {editingKey === "SchedulingWindows" ? (
              <View style={style.editSettingsDialog}>
                <Text>Hello</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={style.settingsSection}>
          <Text>Notifications</Text>
          {/* Use react native - Switch for this - Done */}
          <View style={style.individualSetting}>
            <View style={style.individualSettingRow}>
              <Text style={style.individualSettingInfo}>Notifications: </Text>
              <View style={style.editSettingsButton}>
                <Switch
                  value={
                    settings
                      ? Boolean(settings["notifications_enabled"])
                      : false // When settings has not been loaded, this defaults to false, however
                    // The switch will be disabled if settings is not loaded
                  }
                  /* Lag may be noticable -> possibly switch to updating local state then calling the api */
                  onValueChange={async (value) =>
                    await updateSettings(
                      userId,
                      "notifications_enabled",
                      value,
                      setSettings,
                    )
                  }
                  disabled={settings ? false : true}
                ></Switch>
              </View>
            </View>
          </View>
          <View style={style.individualSetting}>
            <View style={style.individualSettingRow}>
              <Text style={style.individualSettingInfo}>
                Sound:{" "}
                {settings ? settings["notification_sound"] : "Loading..."}
              </Text>
              {/* This won't be implemented currently, given expo go does not support custom notifications
              if a workaround is found, this buttons functionality will start working*/}
              {/* TODO: Remove this setting from rendering */}
              <Pressable style={style.editSettingsButton}>
                <Text>{">"}</Text>
              </Pressable>
            </View>
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

function EditSettingsActions({ onCancel, onSave }) {
  return (
    <View style={style.endEditSettings}>
      <Pressable
        onPress={() => {
          onCancel();
        }}
      >
        <Text>Cancel</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          onSave();
        }}
      >
        <Text>Save</Text>
      </Pressable>
    </View>
  );
}
function timeStringToDate(time) {
  const hours = time.slice(0, 2);
  const minutes = time.slice(3, 5);

  let date = new Date();
  date.setHours(hours, minutes);

  return date;
}
function toggleDropdown(field, editingKey, setEditingKey) {
  if (editingKey !== field) {
    setEditingKey(field);
  } else {
    setEditingKey(null);
  }
}
async function updateSettings(userId, key, value, setSettings) {
  // Need to make sure that scheduling windows don't overwrite
  // the existing scheduling windows
  // Should be done in function that calls this one
  try {
    const updateSettingsUrl =
      API_URL + "/" + String(userId) + "/update_setting";
    const response = await fetch(updateSettingsUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        [key]: value,
      }),
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
async function fetchSettings(userId) {
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

// Format time returned from api into more readable time
// i.e. 23:00:00 -> 23:000
function formatTime(time) {
  return time.slice(0, 5);
}

function formatSchedulingWindows(schedulingWindows) {
  if (!schedulingWindows) {
    return "No windows configured";
  }

  // Inform user if they have multiple scheduling windows
  if (Object.keys(schedulingWindows).length > 1) {
    return `${Object.keys(schedulingWindows)[0]} ...`;
  }
  return Object.keys(schedulingWindows)[0];
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
    flexDirection: "column",
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 5,
    marginVertical: 10,
  },
  individualSettingRow: {
    justifyContent: "space-between", // Push button/arrow to the far right
    flexDirection: "row",
    alignItems: "center",
    minWidth: "75%",
  },
  editSettingsButton: {
    padding: 10,
  },
  editSleepSettings: {
    flexDirection: "row",
    padding: 10,
  },
  sleepTimePicker: {
    alignItems: "center",
    textAlign: "center",
  },
  endEditSettings: {
    flexDirection: "row",
  },
});
