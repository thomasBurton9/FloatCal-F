import {
  Modal,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { createCalendar, fetchCalendars } from "../api/calendarApi";
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

  useEffect(() => {
    async function loadCalendars() {
      const calendarData = await fetchCalendars(userId);
      setCalendars(calendarData);
    }

    if (isVisible && userId) {
      loadCalendars();
    }
  }, [isVisible, userId]);

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
      return <InvitesScreen setCurrentView={setCurrentView}></InvitesScreen>;
    }
    return (
      <CalendarDetailsScreen
        selectedCalendar={selectedCalendar}
        setCurrentView={setCurrentView}
      ></CalendarDetailsScreen>
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
                <Text style={styles.closeButtonText}>X</Text>
              </Pressable>
              <Text style={styles.title}>Manage Calendars</Text>
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
    colour: "#FF0000FF",
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
        <OpacitySlider /> {/* TODO: Decide whether to include this */}
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
        {" "}
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
    colour: "#FF0000FF",
  });
  setCurrentView("list");
}
// Screen with information about one singular calendar
function CalendarDetailsScreen({ selectedCalendar, setCurrentView }) {
  return (
    <View style={styles.placeholderView}>
      <BackButton setCurrentView={setCurrentView}></BackButton>
      <Text style={styles.placeholderTitle}>
        {/* Fall back to calendar details if a calendar is not loaded */}
        {selectedCalendar ? selectedCalendar.name : "Calendar Details"}
      </Text>
    </View>
  );
}

// Currently non functional screen to list invites from others -> TODO: May need new backend db table
function InvitesScreen({ setCurrentView }) {
  return (
    <View style={styles.placeholderView}>
      <BackButton setCurrentView={setCurrentView}></BackButton>
      <Text style={styles.placeholderTitle}>Invites</Text>
    </View>
  );
}

// Button to return to main manage calendar screen
function BackButton({ setCurrentView }) {
  return (
    <Pressable style={styles.backButton} onPress={() => setCurrentView("list")}>
      <Text>Back</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  calendarNameInput: {
    width: "80%",
    minHeight: 40,
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  colorPickerText: {
    fontSize: 18,
  },
  colorPicker: {
    width: "60%", // Required to show element properly
    height: 300,
  },
  colorPreview: {
    height: 30,
    marginVertical: 8,
  },
  createCalendarSubmit: {
    backgroundColor: "blue",
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  createCalendarSubmitText: {
    color: "white",
  },
  manageCalendarsModal: {
    paddingBottom: 0,
    marginBottom: 0,
    flex: 1,
    paddingTop: 40,
    backgroundColor: "rgba(0, 0, 0, 0.12)",
  },
  manageCalendarsContainer: {
    width: "97%",
    // maxWidth: 600, TODO: May be needed for different views: i.e. Ipad
    maxHeight: "100%",
    flex: 1,
    alignSelf: "center",
    backgroundColor: "white",
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 40,
    padding: 12,
    paddingTop: 0,
  },
  // Somehow the styling actually worked
  topBar: {
    width: "100%",
    alignSelf: "center",
    position: "relative",
    height: 55,
    justifyContent: "center",
  },
  closeButton: {
    top: "60%", // Currently aligned using trial and error TODO: Make permament / responsive

    width: 34, // This is not responsive either
    height: 34,

    // Make Button circular
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 100,

    // Center child text in the middle
    alignItems: "center",
    justifyContent: "center",

    zIndex: 1, // Make this element go to the top -> It becomes non functional when removed
  },
  closeButtonText: {
    textAlign: "center",
    fontSize: 22,
    lineHeight: 30,
  },
  title: {
    fontSize: 27,
    textAlign: "center",
  },
  calendarList: {
    width: "100%",
    paddingHorizontal: 6,
  },
  sectionTitle: {
    marginTop: 18,
    marginBottom: 8,
    fontSize: 24,
  },
  calendarButton: {
    minHeight: 56,
    marginBottom: 3,
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarButtonText: {
    fontSize: 22,
  },
  secondaryButton: {
    minHeight: 54,
    marginBottom: 14,
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 22,
  },
  placeholderView: {
    alignItems: "center",
    gap: 20,
    paddingTop: 20,
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 8,
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 6,
  },
  placeholderTitle: {
    fontSize: 24,
  },
});
