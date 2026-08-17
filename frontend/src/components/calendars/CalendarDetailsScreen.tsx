import { Pressable, Text, View } from "react-native";
import type { CalendarDetailsScreenProps } from "../../types/calendars";
import { handleRemoveCalendar } from "../ManageCalendars";
import { styles } from "./calendarStyles";

// Button to return to main manage calendar screen
export function BackButton({
  setCurrentView,
}: Pick<CalendarDetailsScreenProps, "setCurrentView">) {
  return (
    <Pressable style={styles.backButton} onPress={() => setCurrentView("list")}>
      <Text>Back</Text>
    </Pressable>
  );
}

export function CalendarDetailsScreen({
  selectedCalendar,
  setCurrentView,
  userId,
  setCalendars,
}: CalendarDetailsScreenProps) {
  return (
    <View style={styles.placeholderView}>
      <BackButton setCurrentView={setCurrentView}></BackButton>
      <Text style={styles.placeholderTitle}>
        {"Name: "} {/* Using curly brace syntax to keep the space after name */}
        {/* Fall back to calendar details if a calendar is not loaded */}
        {selectedCalendar ? selectedCalendar.name : "Calendar Details"}
      </Text>
      <View
        style={{
          flexDirection: "row",
        }}
      >
        <Text>Colour: </Text>
        <View
          style={{
            width: 100,
            height: 20,
            backgroundColor: selectedCalendar.colour,
          }}
        ></View>
      </View>
      {/* TODO: Add confirmation for deletion in the future*/}
      {/* Display delete dialog only for user created calendars */}
      {/* TODO: Add 'leave calendar' dialog instead */}
      {selectedCalendar.created_by_user_id === userId ? (
        <Pressable
          style={styles.deleteButton}
          onPress={() =>
            handleRemoveCalendar(
              userId,
              selectedCalendar.calendar_id,
              setCalendars,
              setCurrentView,
            )
          }
        >
          <Text>Delete Calendar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
