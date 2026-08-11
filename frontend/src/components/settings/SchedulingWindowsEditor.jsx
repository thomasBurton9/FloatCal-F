import { Pressable, Text, TextInput, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { updateSettings } from "../../api/settingsApi";
import { timeStringToDate } from "../../helpers/dateHelpers";
import EditSettingsActions from "./EditSettingsActions";
import { style } from "./settingsStyles";

export default function SchedulingWindowsEditor({
  userId,
  settings,
  setSettings,
  editingKey,
  setEditingKey,
  schedulingWindows,
  setSchedulingWindows,
}) {
  return (
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
                schedulingWindowsJsonToRows(settings["scheduling_windows"]),
              );
            }
            toggleDropdown("SchedulingWindows", editingKey, setEditingKey);
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
                          const minutes = String(time.getMinutes()).padStart(
                            2,
                            "0",
                          );

                          const next = [...schedulingWindows];
                          next[index] = {
                            ...next[index], // Make next[index] the same as previous i.e. end is included, but start is not included as it is specified below
                            start: `${hours}:${minutes}:00`,
                          };
                          setSchedulingWindows(next);
                        }}
                      ></DateTimePicker>
                    </View>
                    <View style={style.sleepTimePicker}>
                      {/*Reusing sleep time style given the formatting is the same for both pickers */}
                      <Text style={style.sleepDateTimeLabel}>End</Text>{" "}
                      {/* This is preferred times picker */}
                      <DateTimePicker
                        style={style.sleepDateTimeInput}
                        mode="time"
                        is24Hour={true}
                        value={timeStringToDate(window.end)}
                        onChange={(_, time) => {
                          // Add/update dateHelpers function for this
                          if (!time) {
                            return;
                          }
                          const hours = String(time.getHours()).padStart(
                            2,
                            "0",
                          ); // Pad the start with zeros if it is not length 2
                          const minutes = String(time.getMinutes()).padStart(
                            2,
                            "0",
                          );

                          const next = [...schedulingWindows]; // Copy schedulingWindows into next

                          next[index] = {
                            ...next[index], // Make next[index] the same as previous i.e. start is included, but end is not included as it is specified below
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
                schedulingWindowsJsonToRows(settings["scheduling_windows"]),
              );
            }}
            onSave={() => {
              updateSettings(
                userId,
                {
                  scheduling_windows:
                    schedulingWindowsRowsToJson(schedulingWindows),
                },
                setSettings,
              );
            }}
          ></EditSettingsActions>
        </View>
      ) : null}
    </View>
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

function toggleDropdown(field, editingKey, setEditingKey) {
  if (editingKey !== field) {
    setEditingKey(field);
  } else {
    setEditingKey(null);
  }
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
