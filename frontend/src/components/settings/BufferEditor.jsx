import { Pressable, Text, TextInput, View } from "react-native";
import { updateSettings } from "../../api/settingsApi";
import EditSettingsActions from "./EditSettingsActions";
import { style } from "./settingsStyles";

export default function BufferEditor({
  userId,
  settings,
  setSettings,
  editingKey,
  setEditingKey,
  bufferMinutes,
  setBufferMinutes,
}) {
  return (
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
                { buffer_minutes: bufferMinutes },
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
