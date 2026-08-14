import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Switch, Text, TextInput, View } from "react-native";
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
      <View>
        <Text>Name</Text>
        <TextInput
          value={draft.name}
          maxLength={63}
          onChangeText={(name) => updateDraft({ name })}
        ></TextInput>
      </View>
      <View>
        <Text>Date</Text>
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
          <View>
            <Text>Duration</Text>
            <TextInput
              value={String(draft.duration_minutes)}
              placeholder="1-1440"
              inputMode="numeric"
              onChangeText={(duration_minutes) => {
                if (!isNaN(parseInt(duration_minutes))) {
                  // Validate inputs
                  updateDraft({ duration_minutes: parseInt(duration_minutes) });
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
          <View>
            <Text>Start Time</Text>
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
          <View>
            <Text>End Time</Text>
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
      <View>
        <Text>Notes</Text>
        <TextInput
          value={draft.notes}
          onChangeText={(notes) => {
            updateDraft({ notes });
          }}
        ></TextInput>
      </View>
      <View>
        <Text>Recurrence</Text>
        <View>
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
                  labelField="label"
                  valueField="value"
                  data={recurrenceRuleDropDownData}
                  placeholder={"Select Item"}
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
      <View>
        <Text>Reminder</Text>
        <Switch
          value={draft.reminder}
          onValueChange={(reminder) => {
            updateDraft({ reminder });
          }}
        ></Switch>
      </View>
    </>
  );
}
