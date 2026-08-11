import { Pressable, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { updateSettings } from "../../api/settingsApi";
import { timeStringToDate } from "../../helpers/dateHelpers";
import EditSettingsActions from "./EditSettingsActions";
import { style } from "./settingsStyles";

export default function SleepWindowEditor({
  userId,
  settings,
  setSettings,
  editingKey,
  setEditingKey,
  sleepStart,
  setSleepStart,
  sleepEnd,
  setSleepEnd,
}) {
  return (
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
                  const minutes = String(time.getMinutes()).padStart(2, "0");
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
                  const minutes = String(time.getMinutes()).padStart(2, "0");
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
              updateSettings(
                userId,
                { sleep_window: [sleepStart, sleepEnd] },
                setSettings,
              );
            }}
          ></EditSettingsActions>
        </View>
      ) : null}
    </View>
  );
}

function toggleDropdown(field, editingKey, setEditingKey) {
  if (editingKey !== field) {
    setEditingKey(field);
  } else {
    setEditingKey(null);
  }
}

// Format time returned from api into more readable time
// i.e. 23:00:00 -> 23:000
function formatTime(time) {
  return time.slice(0, 5);
}
