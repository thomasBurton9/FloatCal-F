import {
  Modal,
  Pressable,
  ScrollView,
  Alert,
  Text,
  TextInput,
  View,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./calendars/calendarStyles";
import {
  BackButton,
  CalendarDetailsScreen,
} from "./calendars/CalendarDetailsScreen";
import { InvitesScreen } from "./calendars/InvitesScreen";
import {
  createCalendar,
  fetchCalendars,
  removeCalendar,
} from "../api/calendarApi";
import { RED_WARNING_COLOUR } from "../constants";
import ColorPicker, {
  colorKit,
  HueSlider,
  OpacitySlider,
  Panel1,
} from "reanimated-color-picker";

export default function ManageCalendars({
  isVisible,
  setCurrentModal,
  userId,
}) {
  const [calendars, setCalendars] = useState([]); // Populated from api
  const [currentView, setCurrentView] = useState("list"); // "details" || "create" || "invites" || "list" -> Swaps the current screen displayed
  const [selectedCalendar, setSelectedCalendar] = useState(null); // Used when user wants to get info on a calendar

  const [reloadCalendars, setReloadCalendars] = useState(false);
  useEffect(() => {
    async function loadCalendars() {
      const calendarData = await fetchCalendars(userId);
      setCalendars(calendarData);
    }

    if (isVisible && userId) {
      loadCalendars();
    }
  }, [isVisible, userId, reloadCalendars]);

  // Runs only when calendars or userId changes.
  const ownCalendars = useMemo(
    () =>
      calendars.filter((calendar) => calendar.created_by_user_id === userId),
    [calendars, userId],
  );
  const sharedCalendars = useMemo(
    () =>
      calendars.filter((calendar) => calendar.created_by_user_id !== userId),
    [calendars, userId],
  );

  function renderCurrentView() {
    if (currentView === "list") {
      return (
        <CalendarListScreen
          ownCalendars={ownCalendars}
          sharedCalendars={sharedCalendars}
          setCurrentView={setCurrentView}
          setSelectedCalendar={setSelectedCalendar}
        ></CalendarListScreen>
      );
    }
    if (currentView === "create") {
      return (
        <CreateCalendarScreen
          setCurrentView={setCurrentView}
          userId={userId}
          setCalendars={setCalendars}
        ></CreateCalendarScreen>
      );
    }
    if (currentView === "invites") {
      return (
        <InvitesScreen
          setCurrentView={setCurrentView}
          userId={userId}
          currentView={currentView}
          reloadCalendars={reloadCalendars}
          setReloadCalendars={setReloadCalendars}
        ></InvitesScreen>
      );
    }
    // When a calendar is selected
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <CalendarDetailsScreen
          setSelectedCalendar={setSelectedCalendar}
          selectedCalendar={selectedCalendar}
          setCurrentView={setCurrentView}
          userId={userId}
          setCalendars={setCalendars}
          reloadCalendars={reloadCalendars}
          setReloadCalendars={setReloadCalendars}
        ></CalendarDetailsScreen>
      </ScrollView>
    );
  }

  return (
    <>
      <Modal
        transparent
        animationType="slide"
        allowSwipeDismissal={true}
        onRequestClose={() => setCurrentModal(null)}
        visible={isVisible}
      >
        <SafeAreaView
          edges={["top", "bottom"]}
          style={styles.manageCalendarsModal}
        >
          <View style={styles.manageCalendarsContainer}>
            <View style={styles.topBar}>
              <Pressable
                style={styles.closeButton}
                onPress={() => setCurrentModal(null)}
              >
                <Text allowFontScaling={false} style={styles.closeButtonText}>
                  X
                </Text>
                {/* As this is an icon it should not be scaled with text scaling */}
              </Pressable>
              <Text style={styles.title} adjustsFontSizeToFit numberOfLines={1}>
                Manage Calendars
              </Text>
            </View>
            {renderCurrentView()}
            {/* Moved into nested function to avoid massive return statement as in other screens TODO: Modularise / Refactor largest files such as SettingsScreen*/}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

// Display all calendars that a user is a member of.
function CalendarListScreen({
  ownCalendars,
  sharedCalendars,
  setCurrentView,
  setSelectedCalendar,
}) {
  return (
    // Using scrollview to support many calendars on a smaller screen . However the amount should not be 100s therefore rendering all items is fine.
    <ScrollView style={styles.calendarList}>
      <Text style={styles.sectionTitle}>My Calendars</Text>
      {ownCalendars.map((calendar) => (
        <CalendarButton
          key={calendar.calendar_id}
          calendar={calendar}
          setCurrentView={setCurrentView}
          setSelectedCalendar={setSelectedCalendar}
        ></CalendarButton>
      ))}
      <Pressable
        style={styles.secondaryButton}
        onPress={() => setCurrentView("create")}
      >
        <Text style={styles.secondaryButtonText}>Create Calendar</Text>
      </Pressable>
      <Text style={styles.sectionTitle}>Shared with you</Text>
      {sharedCalendars.length !== 0 ? ( // Comparison using length given [] is truthy
        sharedCalendars.map((calendar) => (
          <CalendarButton
            key={calendar.calendar_id}
            calendar={calendar}
            setCurrentView={setCurrentView}
            setSelectedCalendar={setSelectedCalendar}
          ></CalendarButton>
        ))
      ) : (
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>No shared calendars</Text>
        </Pressable>
      )}
      <Pressable
        style={styles.secondaryButton}
        onPress={() => setCurrentView("invites")}
      >
        <Text style={styles.secondaryButtonText}>Invites</Text>
      </Pressable>
    </ScrollView>
  );
}

// Button with the colour of the calendar it displays
function CalendarButton({ calendar, setCurrentView, setSelectedCalendar }) {
  return (
    <Pressable
      style={[
        styles.calendarButton,
        { backgroundColor: calendar.colour || "white" },
      ]}
      onPress={() => {
        setSelectedCalendar(calendar);
        setCurrentView("details");
      }}
    >
      <Text style={styles.calendarButtonText}>{calendar.name}</Text>
    </Pressable>
  );
}

// Screen for calendar creation
function CreateCalendarScreen({ setCurrentView, userId, setCalendars }) {
  const [calendarFields, setCalendarFields] = useState({
    name: "",
    colour: RED_WARNING_COLOUR + "FF",
  });

  return (
    <View style={styles.placeholderView}>
      <BackButton setCurrentView={setCurrentView}></BackButton>
      <Text style={styles.placeholderTitle}>Create Calendar</Text>
      <TextInput
        value={calendarFields.name}
        maxLength={16}
        placeholder="Calendar Name"
        style={styles.calendarNameInput}
        onChangeText={(name) =>
          setCalendarFields({ ...calendarFields, name: name })
        }
      ></TextInput>
      {/* Potentially swap to native ios picker if styling does not work out*/}
      {/* TODO: Potentially change to grid based/ chosen colours instead of free choice */}
      <Text style={styles.colorPickerText}>Choose Calendar Colour</Text>
      <ColorPicker
        style={styles.colorPicker}
        value={calendarFields.colour}
        onCompleteJS={(colour) =>
          setCalendarFields({
            ...calendarFields,
            colour: colorKit.HEX(colour.rgba, true), // Argument "true" is required to prevent the alpha value being cut off
          })
        }
      >
        {/* <Preview style={styles.colorPreview}></Preview>*/}
        <Panel1 />
        <HueSlider />
        <OpacitySlider />
        {/* TODO: Decide whether to include this, it can make everything look a bit cluttered */}
      </ColorPicker>
      <Pressable
        style={styles.createCalendarSubmit}
        onPress={() =>
          handleCreateCalendar(
            calendarFields,
            setCalendarFields,
            userId,
            setCurrentView,
            setCalendars,
          )
        }
      >
        {/* TODO: Fix First press results in the name keyboard opening for some reason??. Second Press works */}
        <Text style={styles.createCalendarSubmitText}>Create Calendar</Text>
      </Pressable>
    </View>
  );
}

async function handleCreateCalendar(
  calendarFields,
  setCalendarFields,
  userId,
  setCurrentView,
  setCalendars,
) {
  // Make sure empty names are not allowed
  calendarFields.name = calendarFields.name.trim();

  if (!calendarFields.name || calendarFields.name.length > 16) {
    Alert.alert("Invalid name", "Name must be between 1 and 16 characters.");
    return;
  }

  // No need to check colour format given it is using colour picker
  // TODO: Potentially add regex validation

  const createdCalendar = await createCalendar(userId, calendarFields);
  if (createdCalendar === undefined) {
    Alert.alert("Unable to create calendar", "Please try again.");
    return;
  }

  const calendarData = await fetchCalendars(userId);
  setCalendars(calendarData);
  setCalendarFields({
    name: "",
    colour: RED_WARNING_COLOUR + "FF",
  });
  setCurrentView("list");
}
// Screen with information about one singular calendar
export async function handleRemoveCalendar(
  userId,
  calendarId,
  setCalendars,
  setCurrentView,
) {
  const removedCalendar = await removeCalendar(userId, calendarId);
  if (removedCalendar === undefined) {
    Alert.alert("Unable to remove calendar", "Please try again.");
    return;
  }
  const calendarData = await fetchCalendars(userId);
  setCalendars(calendarData);
  setCurrentView("list");
}
