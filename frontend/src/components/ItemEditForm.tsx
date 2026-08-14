import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import type {
  CalendarItem,
  itemEditFormProps,
  RecurrenceRule,
} from "../types/calendarItems";
import {
  extractTime,
  formatDate,
  timeStringToDate,
} from "../helpers/dateHelpers";
import { Dropdown } from "react-native-element-dropdown";

export default function ItemEditForm({
  item,
  draft,
  setDraft,
}: itemEditFormProps) {
  const isTask = "duration_minutes" in draft;
  const [recurrenceOn, setRecurrenceOn] = useState(
    Boolean(draft["recurrence_rule"]),
  );

  const recurrenceRuleDropDownData = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Fortnightly", value: "fortnightly" },
    { label: "Monthly", value: "monthly" },
    { label: "Yearly", value: "yearly" },
  ];
  // Changes should be like draft.name or draft.date
  function updateDraft(changes: Partial<CalendarItem>) {
    setDraft({ ...draft, ...changes });
  }
  return (
    <>
      <View style={styles.editForm}>
        <View style={styles.individualEditableSetting}>
          <Text style={styles.editableSettingTitle}>Name</Text>
          <TextInput
            style={styles.textInputStyle}
            value={draft.name}
            maxLength={63}
            onChangeText={(name) => updateDraft({ name })}
          ></TextInput>
        </View>
        <View style={styles.individualEditableSetting}>
          <Text style={styles.editableSettingTitle}>Date</Text>
          <DateTimePicker
            value={new Date(draft.date)} // Check if works
            mode="date"
            onChange={(_, date) => {
              if (!date) {
                return;
              }
              console.log(date);
              // QUICK TODO: Make sure the format gets automatically converted
              updateDraft({ date: formatDate(date) });
            }}
          ></DateTimePicker>
        </View>
        {isTask ? (
          <>
            <View style={styles.individualEditableSetting}>
              <Text style={styles.editableSettingTitle}>Duration</Text>
              <TextInput
                style={styles.textInputStyle}
                value={String(draft.duration_minutes)}
                placeholder="1-1440"
                inputMode="numeric"
                onChangeText={(duration_minutes) => {
                  if (!isNaN(parseInt(duration_minutes))) {
                    // Validate inputs
                    updateDraft({
                      duration_minutes: parseInt(duration_minutes),
                    });
                  }
                }}
              ></TextInput>
            </View>
            {/*<View>
            <Text>Preferred Window</Text>
            {/*<Dropdown></Dropdown  QUICK TODO: Resolve
          </View> */}
          </>
        ) : (
          <>
            <View style={styles.individualEditableSetting}>
              <Text style={styles.editableSettingTitle}>Start Time</Text>
              <DateTimePicker
                value={timeStringToDate(draft.start_time)}
                mode="time"
                is24Hour={true}
                onChange={(_, start_time) => {
                  if (!start_time) {
                    return;
                  }
                  updateDraft({ start_time: extractTime(start_time) });
                }}
              ></DateTimePicker>
            </View>
            <View style={styles.individualEditableSetting}>
              <Text style={styles.editableSettingTitle}>End Time</Text>
              <DateTimePicker
                value={timeStringToDate(draft.end_time)}
                mode="time"
                is24Hour={true}
                onChange={(_, end_time) => {
                  if (!end_time) {
                    return;
                  }
                  updateDraft({ end_time: extractTime(end_time) });
                }}
              ></DateTimePicker>
            </View>
          </>
        )}
        <View style={styles.individualEditableSetting}>
          <Text style={styles.editableSettingTitle}>Notes</Text>
          <TextInput
            maxLength={319}
            multiline={true}
            style={[styles.textInputStyle, styles.notesTextInput]}
            value={draft.notes}
            onChangeText={(notes) => {
              updateDraft({ notes });
            }}
          ></TextInput>
        </View>
        <View style={styles.individualEditableSetting}>
          <Text style={styles.editableSettingTitle}>Recurrence</Text>
          <View style={styles.recurrenceField}>
            <Switch
              value={recurrenceOn}
              onValueChange={(newValue) => {
                setRecurrenceOn(newValue);

                if (!newValue) {
                  updateDraft({ recurrence_rule: null });
                }
              }}
            ></Switch>
            {recurrenceOn ? (
              <>
                <View>
                  <Dropdown
                    style={styles.dropdown}
                    labelField="label"
                    valueField="value"
                    data={recurrenceRuleDropDownData}
                    placeholder={"Select Recurrence Rule"}
                    value={draft.recurrence_rule ?? ""}
                    onChange={(option) => {
                      updateDraft({
                        recurrence_rule: option.value as RecurrenceRule,
                      });
                    }}
                  ></Dropdown>
                </View>
              </>
            ) : null}
          </View>
        </View>
        <View style={styles.individualEditableSetting}>
          <Text style={styles.editableSettingTitle}>Reminder</Text>
          <Switch
            value={draft.reminder}
            onValueChange={(reminder) => {
              updateDraft({ reminder });
            }}
          ></Switch>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  editForm: {
    padding: 10,
  },
  individualEditableSetting: {
    flexDirection: "column",
    gap: 5,
  },
  editableSettingTitle: {
    fontSize: 20,
  },
  textInputStyle: {
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 10,
    padding: 5,
    fontSize: 15,
  },
  notesTextInput: {
    minHeight: 50,
  },
  dropdown: {
    minHeight: 34,
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 5,
  },
  recurrenceField: {
    gap: 10,
  },
});
