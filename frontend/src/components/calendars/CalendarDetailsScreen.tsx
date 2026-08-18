import { Alert, Pressable, Text, View } from "react-native";
import type {
  CalendarDetailsScreenProps,
  currentView,
} from "../../types/calendars";
import { handleRemoveCalendar } from "../ManageCalendars";
import { styles } from "./calendarStyles";
import { removeCalendarMember } from "../../api/calendarApi";

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
  reloadCalendars,
  setReloadCalendars,
}: CalendarDetailsScreenProps) {
  // What happens if selectedCalendar is null (it shouldn't but what if?)
  const ownCalendar = userId === selectedCalendar?.created_by_user_id;

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
      {ownCalendar ? (
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
      ) : (
        <Pressable
          style={styles.deleteButton}
          onPress={() => {
            handleLeaveCalendar(
              userId,
              selectedCalendar.calendar_id,
              setCurrentView,
              reloadCalendars,
              setReloadCalendars,
            );
          }}
        >
          <Text>Leave Calendar</Text>
        </Pressable>
      )}
    </View>
  );
}

async function handleLeaveCalendar(
  userId: number,
  calendarId: number,
  setCurrentView: (view: currentView) => void,
  reloadCalendars: boolean,
  setReloadCalendars: (value: boolean) => void,
) {
  const result = await removeCalendarMember(calendarId, userId);

  if (!result.success) {
    if (result.error) {
      Alert.alert(result.error);
    } else {
      Alert.alert("Error removing calendar member");
    }
  } else {
    Alert.alert("Successfully left calendar");
    setReloadCalendars(!reloadCalendars);
    setCurrentView("list");
  }
}
