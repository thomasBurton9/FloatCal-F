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

export default function ItemEditForm({
  item,
  draft,
  setDraft,
}: itemEditFormProps) {
  const isTask = "duration_minutes" in draft;
  const [recurrenceOn, setRecurrenceOn] = useState(
    Boolean(draft["recurrence_rule"]),
  );

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
              {/* Current bug preventing recurrence from being entered due to the check*/}
              <View>
                <TextInput
                  value={draft.recurrence_rule ?? ""}
                  placeholder="daily, weekly, fortnightly, monthly or yearly"
                  onChangeText={(recurrence_rule) => {
                    if (
                      [
                        "daily",
                        "weekly",
                        "fortnightly",
                        "monthly",
                        "yearly",
                      ].includes(recurrence_rule)
                    ) {
                      updateDraft({
                        recurrence_rule: recurrence_rule as RecurrenceRule,
                      }); // Have to make sure that the types match
                    }
                  }}
                ></TextInput>
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
