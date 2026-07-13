import { useEffect, useState, useMemo } from "react";
import {
  Text,
  View,
  StyleSheet,
  Pressable,
  Switch,
  TextInput,
  PanResponder,
} from "react-native";
import { API_URL } from "../constants";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function SettingsScreen({ userId, setUserId, setPage }) {
  const [settings, setSettings] = useState(null);
  const [editingKey, setEditingKey] = useState(null); // Which setting is the user currently editing

  const [sleepStart, setSleepStart] = useState(null);
  const [sleepEnd, setSleepEnd] = useState(null);
  const [bufferMinutes, setBufferMinutes] = useState(null);
  const [schedulingWindows, setSchedulingWindows] = useState([]);

  // Allow for swipe right gesture to change screens.
  // Using useMemo instead of useRef as in docs due to linter errors
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // Only initialise when gesture is large enough and in the right direction
        onMoveShouldSetPanResponder: (_, gesture) =>
          gesture.dx > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy),

        // If gesture is completed and is large enough -> change screen
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > 40 && Math.abs(gesture.dx) > Math.abs(gesture.dy)) {
            // TODO: Configure gesture strength based on testing, add button to change page.
            setPage("DailyCalendar");
          }
        },
      }),
    [setPage],
  ); // Prevent re rendering page every time state changes

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
      <View {...panResponder.panHandlers} style={style.screen}>
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
                    <Text style={style.sleepDateTimeLabel}>Sleep Start</Text>
                    <DateTimePicker
                      // Styling required due to slight misalignment of item as compared to the label
                      style={style.sleepDateTimeInput}
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
                    <Text style={style.sleepDateTimeLabel}>Sleep End</Text>
                    <DateTimePicker
                      style={style.sleepDateTimeInput}
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
                {settings ? settings["buffer_minutes"] + " min" : "Loading..."}
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
                <View style={style.bufferInputRow}>
                  <Text>Minutes</Text>
                  {/* TODO: Keyboard does not close when tapping somewhere else*/}
                  <TextInput
                    // TextInput only accepts string -> it does not accept numbers
                    value={String(bufferMinutes)}
                    inputMode={"numeric"}
                    onChangeText={(e) => setBufferMinutes(e)}
                    style={style.bufferMinutesInput}
                  ></TextInput>
                  <Text>min</Text>
                </View>
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
                disabled={settings ? false : true}
                onPress={() => {
                  if (editingKey !== "SchedulingWindows") {
                    setSchedulingWindows(
                      schedulingWindowsJsonToRows(
                        settings["scheduling_windows"],
                      ),
                    );
                  }
                  toggleDropdown(
                    "SchedulingWindows",
                    editingKey,
                    setEditingKey,
                  );
                }}
                style={style.editSettingsButton}
              >
                <Text>{editingKey !== "SchedulingWindows" ? ">" : "V"}</Text>
              </Pressable>
            </View>
            {editingKey === "SchedulingWindows" ? (
              <View style={style.editSettingsDialog}>
                {schedulingWindows
                  ? schedulingWindows.map((window, index) => (
                      <View key={index} style={style.schedulingWindowRow}>
                        <View style={style.schedulingWindowColumn}>
                          <TextInput
                            value={window.name}
                            placeholder="Name"
                            onChangeText={(name) => {
                              const next = [...schedulingWindows]; // New updated scheduling windows with added entry
                              next[index] = { ...next[index], name };
                              setSchedulingWindows(next);
                            }}
                            style={style.schedulingWindowNameInput}
                          ></TextInput>
                          <Pressable
                            onPress={() =>
                              setSchedulingWindows(
                                schedulingWindows.filter(
                                  (_, rowIndex) => rowIndex !== index,
                                ), // Replace schedulingWindows with windows that do not match the deleted index
                              )
                            }
                          >
                            <Text>Delete</Text>
                          </Pressable>
                        </View>
                        <View style={style.schedulingWindowColumn}>
                          <View style={style.sleepTimePicker}>
                            {/*Reusing sleep time style given the formatting is the same for both pickers */}
                            <Text style={style.sleepDateTimeLabel}>Start</Text>
                            <DateTimePicker
                              style={style.sleepDateTimeInput}
                              mode="time"
                              is24Hour={true}
                              value={timeStringToDate(window.start)}
                              onChange={(_, time) => {
                                if (!time) {
                                  return;
                                }
                                const hours = String(time.getHours()).padStart(
                                  2,
                                  "0",
                                ); // Pad the start with zeros if it is not length 2
                                const minutes = String(
                                  time.getMinutes(),
                                ).padStart(2, "0");

                                const next = [...schedulingWindows];
                                next[index] = {
                                  ...next[index],
                                  start: `${hours}:${minutes}:00`,
                                };
                                setSchedulingWindows(next);
                              }}
                            ></DateTimePicker>
                          </View>
                          <View style={style.sleepTimePicker}>
                            {/*Reusing sleep time style given the formatting is the same for both pickers */}
                            <Text style={style.sleepDateTimeLabel}>End</Text>
                            <DateTimePicker
                              style={style.sleepDateTimeInput}
                              mode="time"
                              is24Hour={true}
                              value={timeStringToDate(window.end)}
                              onChange={(_, time) => {
                                if (!time) {
                                  return;
                                }
                                const hours = String(time.getHours()).padStart(
                                  2,
                                  "0",
                                ); // Pad the start with zeros if it is not length 2
                                const minutes = String(
                                  time.getMinutes(),
                                ).padStart(2, "0");

                                const next = [...schedulingWindows];
                                next[index] = {
                                  ...next[index],
                                  end: `${hours}:${minutes}:00`,
                                };
                                setSchedulingWindows(next);
                              }}
                            ></DateTimePicker>
                          </View>
                        </View>
                      </View>
                    ))
                  : null}
                <Pressable
                  onPress={() =>
                    setSchedulingWindows(() => [
                      ...(schedulingWindows ?? []), // Error occurs if trying to 'unpack' schedulingWindows when it is null
                      {
                        name: "New Window",
                        start: "09:00:00",
                        end: "17:00:00",
                      },
                    ])
                  }
                >
                  <Text>Add Window</Text>
                </Pressable>
                <EditSettingsActions
                  onCancel={() => {
                    setEditingKey(null);
                    setSchedulingWindows(
                      schedulingWindowsJsonToRows(
                        settings["scheduling_windows"],
                      ),
                    );
                  }}
                  onSave={() => {
                    updateSettings(
                      userId,
                      "scheduling_windows",
                      schedulingWindowsRowsToJson(schedulingWindows),
                      setSettings,
                    );
                  }}
                ></EditSettingsActions>
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

function schedulingWindowsJsonToRows(schedulingWindows) {
  if (!schedulingWindows) {
    return [];
  }
  // Convert object into array for ease of displaying multiple scheduling windows
  const rows = Object.entries(schedulingWindows).map(
    ([name, [start, end]]) => ({ name, start, end }),
  );
  return rows;
}
function schedulingWindowsRowsToJson(rows) {
  if (!rows) {
    return;
  }

  const jsonObject = Object.fromEntries(
    rows
      .filter((row) => row.name.trim())
      .map((row) => [row.name.trim(), [row.start, row.end]]),
  ); // Filter prevents blank names from being used
  return jsonObject;
}
function EditSettingsActions({ onCancel, onSave }) {
  return (
    <View style={style.endEditSettings}>
      <Pressable
        style={[style.editSettingsEndButtons, style.cancelEditSettingsButton]}
        onPress={() => {
          onCancel();
        }}
      >
        <Text>Cancel</Text>
      </Pressable>
      <Pressable
        style={[style.editSettingsEndButtons, style.saveEditSettingsButton]}
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
  if (!schedulingWindows || Object.keys(schedulingWindows).length === 0) {
    // Check object length as well given if ({}) -> results in true
    return "No windows configured";
  }

  // Inform user if they have multiple scheduling windows
  if (Object.keys(schedulingWindows).length > 1) {
    return `${Object.keys(schedulingWindows)[0]} ...`;
  }
  return Object.keys(schedulingWindows)[0];
}
// TODO: Fix alignment of sleep window picker -> Possibly will require changing from row based layout to column based layout
// Possibly having to remove/split the EditSettingsActions component
const style = StyleSheet.create({
  screen: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsSection: {
    width: "100%", // Prevent prefferred times window from expanding
    flexDirection: "column",
    alignItems: "center",
  },
  individualSettingInfo: {
    paddingLeft: 10,
  },
  individualSetting: {
    width: "75%",
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
    width: "100%",
  },
  editSettingsButton: {
    padding: 10,
  },
  editSleepSettings: {
    flexDirection: "row",
    gap: 20,
    justifyContent: "center",
  },
  sleepTimePicker: {
    alignItems: "center",
    textAlign: "center",
    width: 110,
  },
  endEditSettings: {
    flexDirection: "row",
    gap: 60, // Use gap instead of margin in the children to standardize the gap.
    justifyContent: "center",
  },
  editSettingsEndButtons: {
    padding: 10,
    borderStyle: "solid",
    borderWidth: 3,
    borderRadius: 25,
    minWidth: 70, // Make the buttons the same size
    alignItems: "center", // Make sure text is in the centre
  },
  saveEditSettingsButton: {
    borderColor: "green",
    backgroundColor: "#00FF0080", // 50% Opacity
  },
  cancelEditSettingsButton: {
    borderColor: "red",
    backgroundColor: "#FF000080",
  },
  editSettingsDialog: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 14,
    alignItems: "center", // Help align cancel/save buttons and the inputs
  },
  bufferInputRow: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  bufferMinutesInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    width: 50, // Make it look like a proper input
    textAlign: "center",
  },
  sleepDateTimeInput: {
    alignSelf: "center",
    width: 100,
  },
  sleepDateTimeLabel: {
    // width: "70%",
    alignSelf: "center",
  },
  schedulingWindowRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly", // Keep gap between items the same size
    paddingVertical: 10, // Room between items.
  },
  schedulingWindowNameInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    width: 110, // May need to change to be more responsive
    textAlign: "center",
    // flexShrink: 1, // Shrink name input for phones
  },
  schedulingWindowColumn: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  // TODO: Add style for delete and add window buttons in scheduling windows
  // TODO: Align the items in the 2 columns, Somehow
});
