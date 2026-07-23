import {
  Modal,
  TextInput,
  Pressable,
  Text,
  StyleSheet,
  View,
  Switch,
  Alert,
  Keyboard,
} from "react-native";
import { useEffect, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Dropdown } from "react-native-element-dropdown";
import { fetchCalendars } from "../api/calendarApi.js";
import { fetchSettings } from "../api/settingsApi.js";
import { createFixedEvent, createFloatingTask } from "../api/itemApi.js";
import { SafeAreaView } from "react-native-safe-area-context"; // Modal does not respect the safearea view from App.jsx

export default function AddItem({ isVisible, setCurrentModal, userId }) {
  const [itemType, setItemType] = useState("Floating");
  const [calendars, setCalendars] = useState([]);
  const [preferredWindowOptions, setPreferredWindowOptions] = useState([]);

  const [itemFields, setItemFields] = useState({
    name: "",
    date: new Date(),
    duration: "",
    startTime: new Date(),
    endTime: new Date(),
    notes: "",
    preferredWindow: "",
    calendar: "",
    recurrenceOn: false,
    recurrenceRule: "",
    remindersOn: false,
  });

  useEffect(() => {
    async function loadCalendars() {
      const calendarData = await fetchCalendars(userId);
      setCalendars(calendarData);
      if (calendarData.length > 0) {
        setItemFields((currentFields) => {
          if (currentFields.calendar) {
            return currentFields;
          }
          return {
            ...currentFields,
            calendar: calendarData[0].calendar_id,
          };
        });
      }
    }

    async function loadPreferredWindows() {
      const windows = await getPreferredWindows(userId);
      setPreferredWindowOptions(windows);
      setItemFields((currentFields) => {
        const selectedWindowExists = windows.some(
          (window) => window.name === currentFields.preferredWindow,
        );
        if (!currentFields.preferredWindow || selectedWindowExists) {
          return currentFields;
        }
        return { ...currentFields, preferredWindow: "" };
      });
    }

    if (isVisible && userId) {
      loadCalendars();
      loadPreferredWindows();
    }
  }, [isVisible, userId]);

  return (
    <>
      <Modal
        transparent
        animationType="slide"
        allowSwipeDismissal={true}
        onRequestClose={() => null} // TODO: Implement function
        visible={isVisible} // currentModal === "addItem"
      >
        <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
          {/* Allow for dismissal of keyboard some fields */}
          <SafeAreaView edges={["top"]} style={styles.addItemModal}>
            <View style={styles.addItemModalContainer}>
              <View style={styles.topBar}>
                <Pressable onPress={() => setCurrentModal(null)}>
                  <Text
                    // TODO: Change styles for X button inline with the working ones from ManageCalendars/ManageTasks
                    style={{
                      minWidth: 30,
                      minHeight: 30,
                      justifyContent: "center",
                      textAlign: "center",
                      alignItems: "center",
                      borderStyle: "solid",
                      borderRadius: "100%",
                      borderWidth: 2,
                    }}
                  >
                    X
                  </Text>
                </Pressable>
                <Text>Add Task</Text>
              </View>
              <ItemTypeSwitcher
                itemType={itemType}
                setItemType={setItemType}
              ></ItemTypeSwitcher>
              <View style={styles.addItemInputs}>
                {/* Name */}
                <View style={styles.individualInput}>
                  <Text>Name</Text>
                  <TextInput
                    value={itemFields.name}
                    maxLength={63}
                    style={styles.inputField}
                    onChangeText={(name) =>
                      setItemFields({ ...itemFields, name })
                    }
                  ></TextInput>
                </View>
                {/* Date */}
                <View style={styles.individualInput}>
                  <Text>Date</Text>
                  <DateTimePicker
                    value={itemFields.date}
                    mode="date"
                    onChange={(_, date) => {
                      if (!date) {
                        return;
                      }
                      setItemFields({ ...itemFields, date });
                    }}
                  ></DateTimePicker>
                </View>
                {/* Calendar */}
                <View style={styles.individualInput}>
                  <Text>Calendar</Text>
                  <Dropdown
                    data={calendars}
                    labelField="name"
                    valueField="calendar_id"
                    value={itemFields.calendar}
                    placeholder="Select calendar"
                    style={styles.dropdown}
                    onChange={(calendar) =>
                      setItemFields({
                        ...itemFields,
                        calendar: calendar.calendar_id,
                      })
                    }
                  ></Dropdown>
                </View>
                {itemType === "Floating" ? (
                  <>
                    {/* Duration */}
                    <View style={styles.individualInput}>
                      <Text>Duration in minutes</Text>
                      <TextInput
                        value={itemFields.duration}
                        inputMode="numeric"
                        placeholder="1-1440"
                        style={styles.inputField}
                        onChangeText={(duration) =>
                          setItemFields({ ...itemFields, duration })
                        }
                      ></TextInput>
                    </View>
                    {/* Preferred window */}
                    <View style={styles.individualInput}>
                      <Text>Preferred window</Text>
                      <Dropdown
                        data={preferredWindowOptions}
                        labelField="name"
                        valueField="name"
                        value={itemFields.preferredWindow}
                        placeholder="No preference"
                        style={styles.dropdown}
                        onChange={(preferredWindow) =>
                          setItemFields({
                            ...itemFields,
                            preferredWindow: preferredWindow.name,
                          })
                        }
                      ></Dropdown>
                    </View>
                  </>
                ) : (
                  <>
                    {/* Start time */}
                    <View style={styles.individualInput}>
                      <Text>Start time</Text>
                      <DateTimePicker
                        value={itemFields.startTime}
                        mode="time"
                        is24Hour={true}
                        onChange={(_, startTime) => {
                          if (!startTime) {
                            return;
                          }
                          setItemFields({ ...itemFields, startTime });
                        }}
                      ></DateTimePicker>
                    </View>
                    {/* End time */}
                    <View style={styles.individualInput}>
                      <Text>End time</Text>
                      <DateTimePicker
                        value={itemFields.endTime}
                        mode="time"
                        is24Hour={true}
                        onChange={(_, endTime) => {
                          if (!endTime) {
                            return;
                          }
                          setItemFields({ ...itemFields, endTime });
                        }}
                      ></DateTimePicker>
                    </View>
                  </>
                )}
                {/* Notes */}
                <View style={styles.individualInput}>
                  <Text>Notes</Text>
                  <TextInput
                    value={itemFields.notes}
                    maxLength={319}
                    multiline={true}
                    style={styles.inputField}
                    onChangeText={(notes) =>
                      setItemFields({ ...itemFields, notes })
                    }
                  ></TextInput>
                </View>
                {/* Recurrence */}
                <View style={styles.individualInput}>
                  <Text>Recurrence</Text>
                  <Switch
                    value={itemFields.recurrenceOn}
                    onValueChange={(recurrenceOn) =>
                      setItemFields({ ...itemFields, recurrenceOn })
                    }
                  ></Switch>
                </View>
                {itemFields.recurrenceOn ? (
                  <View style={styles.individualInput}>
                    <Text>Recurrence rule</Text>
                    <TextInput
                      value={itemFields.recurrenceRule}
                      placeholder="daily, weekly, fortnightly, monthly or yearly"
                      style={styles.inputField}
                      onChangeText={(recurrenceRule) =>
                        setItemFields({ ...itemFields, recurrenceRule })
                      }
                    ></TextInput>
                  </View>
                ) : null}
                {/* Reminder */}
                <View style={styles.individualInput}>
                  <Text>Reminder</Text>
                  <Switch
                    value={itemFields.remindersOn}
                    onValueChange={(remindersOn) =>
                      setItemFields({ ...itemFields, remindersOn })
                    }
                  ></Switch>
                </View>
                {/* Add Item Button*/}
                <Pressable
                  style={styles.addItemButton}
                  onPress={() =>
                    handleAddItem(
                      itemType,
                      setCurrentModal,
                      itemFields,
                      setItemFields,
                    )
                  }
                >
                  <Text>
                    {itemType === "Floating" ? "Add Task" : "Add Event"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </Pressable>
      </Modal>
    </>
  );
}

async function getPreferredWindows(userId) {
  const settings = await fetchSettings(userId);
  if (!settings || !settings.scheduling_windows) {
    return [];
  }

  return Object.keys(settings.scheduling_windows).map((name) => ({ name }));
}

async function handleAddItem(
  itemType,
  setCurrentModal,
  itemFields,
  setItemFields,
) {
  const recurrenceRules = [
    "daily",
    "weekly",
    "fortnightly",
    "monthly",
    "yearly",
  ];
  // TODO: Potentially change from alerts to actual fields
  // Length checks should theoretically be not needed given TextInput components natively prevent this
  // Kept anyways as a second layer of validation
  if (!itemFields.name || itemFields.name.length > 63) {
    Alert.alert("Invalid name", "Name must be between 1 and 63 characters.");
    return;
  }
  // Make sure date is an actual date and is not none/invalid
  if (!(itemFields.date instanceof Date) || isNaN(itemFields.date.getTime())) {
    Alert.alert("Invalid date", "Please select a valid date.");
    return;
  }

  if (!itemFields.calendar) {
    Alert.alert("Invalid calendar", "Please select a calendar.");
    return;
  }
  if (itemFields.notes.length > 319) {
    Alert.alert("Invalid notes", "Notes must be fewer than 320 characters.");
    return;
  }
  if (
    itemFields.recurrenceOn &&
    !recurrenceRules.includes(itemFields.recurrenceRule)
  ) {
    Alert.alert(
      "Invalid recurrence",
      "Recurrence must be daily, weekly, fortnightly, monthly or yearly.",
    );
    return;
  }

  if (itemType === "Floating") {
    const duration = Number(itemFields.duration);

    if (!Number.isInteger(duration) || duration < 1 || duration > 1440) {
      Alert.alert(
        "Invalid duration",
        "Duration must be a whole number between 1 and 1440 minutes.",
      );
      return;
    }
    const createdTask = await createFloatingTask(
      itemFields.calendar,
      itemFields,
    );
    if (createdTask === undefined) {
      Alert.alert("Unable to add task", "Please try again.");
      return;
    }
    // TODO: Automatically attempt to schedule task when adding a new floating task.
  } else if (itemType === "Fixed") {
    if (
      !(itemFields.startTime instanceof Date) ||
      !(itemFields.endTime instanceof Date)
    ) {
      Alert.alert("Invalid time", "Please select valid start and end times.");
      return;
    }
    const startMinutes =
      itemFields.startTime.getHours() * 60 + itemFields.startTime.getMinutes();
    const endMinutes =
      itemFields.endTime.getHours() * 60 + itemFields.endTime.getMinutes();
    if (startMinutes >= endMinutes) {
      Alert.alert("Invalid time", "End time must be after start time.");
      return;
    }
    const createdEvent = await createFixedEvent(
      itemFields.calendar,
      itemFields,
    );
    if (createdEvent === undefined) {
      Alert.alert("Unable to add event", "Please try again.");
      return;
    }
  } else {
    Alert.alert("Invalid item type", "Error in selecting item type");
    return;
  }

  setItemFields({
    name: "",
    date: new Date(),
    duration: "",
    startTime: new Date(),
    endTime: new Date(),
    notes: "",
    preferredWindow: "",
    calendar: "",
    recurrenceOn: false,
    recurrenceRule: "",
    remindersOn: false,
  });
  setCurrentModal(null);
}

function ItemTypeSwitcher({ itemType, setItemType }) {
  return (
    <>
      <View style={styles.itemTypeSwitcher}>
        <Pressable
          /* Use blue colouring when selected, white otherwise */
          style={[
            itemType === "Floating"
              ? styles.currentType
              : styles.nonCurrentType,
            styles.itemType,
            styles.floatingItem,
          ]}
          onPress={() => setItemType("Floating")}
        >
          <Text>Floating</Text>
        </Pressable>
        <Pressable
          /* Use blue colouring when selected, white otherwise */
          style={[
            itemType === "Fixed" ? styles.currentType : styles.nonCurrentType,
            styles.itemType,
            styles.fixedItem,
          ]}
          onPress={() => setItemType("Fixed")}
        >
          <Text>Fixed</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  addItemModal: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: "rgba(0, 0, 0, 0.12)", // If kept white it will just blend in with the modal
  },
  addItemModalContainer: {
    width: "100%",
    maxHeight: "95%",
    alignItems: "center", // Center content horizontally
    // justifyContent: "center", // Center content vertically
    backgroundColor: "white",
    flex: 1, // Force expand to full screen
    borderStyle: "solid",
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    borderWidth: 2,
    padding: 16,
  },
  itemTypeSwitcher: {
    flexDirection: "row",
    borderStyle: "solid",
    borderRadius: 10,
    borderWidth: 3,
  },
  currentType: {
    backgroundColor: "blue",
  },
  nonCurrentType: {
    backgroundColor: "white",
  },
  topBar: {
    flexDirection: "row",
  },
  itemType: {
    padding: 10,
    width: 100,
    alignItems: "center", // Center text horizontally,
    justifyContent: "center", // Center text vertically
  },

  floatingItem: {
    borderTopLeftRadius: 7, // Should be exactly authenticationSwitcher.borderRadius - authenticationSwitcher.borderWidth
    borderBottomLeftRadius: 7,
  },
  fixedItem: {
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
  },

  addItemInputs: {
    flexDirection: "column",
    gap: 6,
    width: "100%",
  },
  individualInput: {
    flexDirection: "column",
    gap: 4,
  },
  inputField: {
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 6,
  },
  dropdown: {
    minHeight: 34,
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 5,
  },
  addItemButton: {
    backgroundColor: "blue",
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
});
