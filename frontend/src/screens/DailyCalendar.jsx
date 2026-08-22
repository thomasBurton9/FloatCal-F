import { Text, View, StyleSheet, Pressable, Image } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState, useEffect, useRef } from "react";
import {
  CalendarBody,
  CalendarContainer,
  CalendarHeader,
} from "@howljs/calendar-kit";
import { fetchCalendars } from "../api/calendarApi";
import { formatDate, addMinutesToDateTime } from "../helpers/dateHelpers";
import { fetchItems } from "../api/itemApi";
import AddItem from "../components/AddItem";
import ManageCalendars from "../components/ManageCalendars";
import ManageTasks from "../components/ManageTasks";
import SchedulingError from "../components/SchedulingError";
import ItemInfoModal from "../components/ItemInfoModal";
import { lightenHex } from "../helpers/colourHelpers";
import { calendarItemFromDragEvent } from "../helpers/calendarDrag";
import SearchModal from "../components/SearchModal";
import ManuallyScheduleTask from "../components/ManuallyScheduleTask";
import { RED_WARNING_COLOUR } from "../constants.js";
import { calendarTheme } from "../components/calendars/calendarStyles";

// Calendar at the top
// Then bottombar 1/5th or 1/6th
// TODO: Add theme for calendar
export default function DailyCalendar({ setPage, userId }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentModal, setCurrentModal] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // Current selected item -> Used for task info popup
  const [returnModal, setReturnModal] = useState(null);
  const [addItemPreset, setAddItemPreset] = useState(null);
  const [editedPreset, setEditedPreset] = useState(null);

  function handleDragCreateEvent(event) {
    const startDateTime = event?.start?.dateTime;
    const endDateTime = event?.end?.dateTime;

    if (!startDateTime || !endDateTime) {
      return;
    }

    const startTime = new Date(startDateTime);
    const endTime = new Date(endDateTime);

    if (
      Number.isNaN(startTime.getTime()) ||
      Number.isNaN(endTime.getTime()) ||
      endTime <= startTime
    ) {
      return;
    }

    setAddItemPreset({
      itemType: "Fixed",
      date: new Date(startTime),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });
    setCurrentModal("addItem");
  }

  function handleDragEdit(event) {
    const editedItem = calendarItemFromDragEvent(event);

    if (!editedItem || !event?.calendarItem) {
      return;
    }

    setSelectedItem(event.calendarItem);
    setEditedPreset(editedItem);
    setReturnModal(null);
    setCurrentModal("itemInfo");
  }

  const calendarRef = useRef(null);
  const [itemAddedTrigger, setItemAddedTrigger] = useState(false);
  useEffect(() => {
    calendarRef.current?.goToDate({
      date: formatDate(currentDate),
      animatedDate: true,
    });
  }, [currentDate]); // Maybe move this to actual date switcher to only changes dates when picker is closed

  const [items, setItems] = useState([]); // Need id, title, start, end, color, + recurrenceRule

  useEffect(() => {
    async function loadItems() {
      try {
        const itemData = await fetchItems(userId, currentDate);
        if (itemData) {
          console.log(itemData);
          const formattedItems = await formatItems(itemData, userId);
          setItems(formattedItems);
        }
      } catch (error) {
        console.error("Error loading calendar items", error);
        setItems([]);
      }
    }
    loadItems();
  }, [userId, currentDate, itemAddedTrigger]);
  return (
    <>
      <View style={style.dailyViewScreen}>
        <CalendarView
          items={items}
          calendarRef={calendarRef}
          setCurrentDate={setCurrentDate}
          currentDate={currentDate}
          onItemPress={(item) => {
            setEditedPreset(null);
            setSelectedItem(item);
            setCurrentModal("itemInfo");
          }}
          onDragCreateEvent={handleDragCreateEvent}
          onDragEdit={handleDragEdit}
          setReturnModal={setReturnModal}
        ></CalendarView>
        <BottomBar
          setPage={setPage}
          userId={userId}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          onItemPress={(item) => {
            setEditedPreset(null);
            setSelectedItem(item);
            setCurrentModal("itemInfo");
          }}
          currentModal={currentModal}
          setCurrentModal={setCurrentModal}
          onItemAdded={() => setItemAddedTrigger(!itemAddedTrigger)}
          addItemPreset={addItemPreset}
          clearAddItemPreset={() => setAddItemPreset(null)}
          setReturnModal={setReturnModal}
        ></BottomBar>
        <ItemInfoModal
          isVisible={currentModal === "itemInfo"}
          item={selectedItem}
          setSelectedItem={setSelectedItem}
          setCurrentModal={(modal) => {
            setCurrentModal(modal);
            if (modal !== "itemInfo") {
              setEditedPreset(null);
            }
            if (modal === null) {
              setSelectedItem(null);
            }
          }}
          returnModal={returnModal}
          setReturnModal={setReturnModal}
          editedPreset={editedPreset}
          onChangedData={() => setItemAddedTrigger(!itemAddedTrigger)} // Update the calendar when changing data
        ></ItemInfoModal>
      </View>
    </>
  );
}

// TODO: Add reccurence
async function formatItems(items, userId) {
  // Items is a list[FixedEvent | FloatingTask]
  // Convert into [
  // {
  //  id: id,
  // title: title
  // start: {dateTime: date + start time}
  // end: {dateTime: date + end time}
  // color: color
  // }
  // ]
  const calendars = await fetchCalendars(userId); // Should be list[Calendar]
  let outputItems = [];
  for (const item of items) {
    if (Object.hasOwn(item, "duration_minutes")) {
      // Floating Tasks
      let baseColour = getCalendarColour(calendars, item["calendar_id"]);

      if (baseColour) {
        baseColour = lightenHex(baseColour, 0.3);
      } else {
        baseColour = RED_WARNING_COLOUR + "FF";
      }

      outputItems.push({
        id: `task:${item["task_id"]}`,
        title: item["name"],
        calendarItem: {
          ...item,
          calendar_name: getCalendarName(calendars, item["calendar_id"]),
        },
        start: { dateTime: item["date"] + "T" + item["scheduled_start"] },
        end: {
          dateTime: addMinutesToDateTime(
            item["date"],
            item["scheduled_start"],
            item["duration_minutes"],
          ),
        }, // Return base colour in case of failures
        color: baseColour, // Colour of floating tasks and fixed events differ
      });
    } else {
      outputItems.push({
        id: `event:${item["event_id"]}`,
        title: item["name"],
        calendarItem: {
          ...item,
          calendar_name: getCalendarName(calendars, item["calendar_id"]),
        },
        start: { dateTime: item["date"] + "T" + item["start_time"] }, // calendar package wants explicit 'T' separator
        end: { dateTime: item["date"] + "T" + item["end_time"] },
        color:
          getCalendarColour(calendars, item["calendar_id"]) ||
          RED_WARNING_COLOUR + "FF",
      });
    }
  }
  return outputItems;
}

function getCalendarColour(calendars, calendarId) {
  for (const calendar of calendars) {
    if (calendar["calendar_id"] === calendarId) {
      return calendar["colour"];
    }
  }
}

function getCalendarName(calendars, calendarId) {
  for (const calendar of calendars) {
    if (calendar["calendar_id"] === calendarId) {
      return calendar["name"];
    }
  }
  return "Unknown calendar";
}

function CalendarView({
  items,
  currentDate,
  setCurrentDate,
  calendarRef,
  onItemPress,
  onDragCreateEvent,
  onDragEdit,
  setReturnModal,
}) {
  return (
    <>
      <View style={style.mainCalendarContainer}>
        <CalendarContainer
          theme={calendarTheme}
          onDragCreateEventEnd={onDragCreateEvent}
          onDragEventEnd={onDragEdit}
          ref={calendarRef}
          numberOfDays={1}
          scrollByDay={true}
          firstDay={7}
          allowDragToCreate={true}
          allowDragToEdit={true}
          allowPinchToZoom={true}
          overlapType="no-overlap" // TODO: Look back to client feedback to see if changing to 'overlap' makes sense
          initialDate={formatDate(currentDate)}
          events={items}
          onPressEvent={(event) => {
            setReturnModal(null); // Make sure after closing the itemInfo, it returns to the home daily view (technically not necessary)
            onItemPress(event.calendarItem);
          }}
          onDateChanged={(date) => {
            console.log(date);
            console.log(typeof date);
            setCurrentDate(new Date(date));
          }}
        >
          <CalendarHeader />
          <CalendarBody />
        </CalendarContainer>
      </View>
    </>
  );
}

function BottomBar({
  setPage,
  userId,
  currentDate,
  setCurrentDate,
  currentModal,
  setCurrentModal,
  onItemAdded,
  addItemPreset,
  clearAddItemPreset,
  onItemPress,
  setReturnModal,
}) {
  const [schedulingErrorTask, setSchedulingErrorTask] = useState(null);
  // const [schedulingErrorTask, setSchedulingErrorTask] = useState({
  //   taskId: 0,
  //   calendarId: 0,
  //   name: "Test scheduling error task",
  //   durationMinutes: 30,
  // });
  return (
    <View style={style.bottomBar}>
      <BottomLeftNavigation
        setPage={setPage}
        setCurrentModal={setCurrentModal}
        onOpenAddItem={() => {
          clearAddItemPreset();
          setCurrentModal("addItem");
        }}
      ></BottomLeftNavigation>
      <DatePicker
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
      ></DatePicker>
      <ManageFloatingTasksButton
        setCurrentModal={setCurrentModal}
      ></ManageFloatingTasksButton>
      <AddItem
        isVisible={currentModal === "addItem"}
        setCurrentModal={setCurrentModal}
        userId={userId}
        onItemAdded={onItemAdded}
        setSchedulingErrorTask={setSchedulingErrorTask}
        initialPreset={addItemPreset}
        clearInitialPreset={clearAddItemPreset}
      ></AddItem>
      <ManageCalendars
        isVisible={currentModal === "manageCalendars"}
        setCurrentModal={setCurrentModal}
        userId={userId}
      ></ManageCalendars>
      <ManageTasks
        isVisible={currentModal === "manageTasks"}
        setCurrentModal={setCurrentModal}
        userId={userId}
        onItemPress={onItemPress}
        setReturnModal={setReturnModal}
      ></ManageTasks>
      <SearchModal
        isVisible={currentModal === "search"}
        setCurrentModal={setCurrentModal}
        userId={userId}
        onItemPress={(item) => {
          setReturnModal("search");
          onItemPress(item);
        }}
      ></SearchModal>
      {schedulingErrorTask ? (
        <>
          <SchedulingError
            isVisible={currentModal === "schedulingError"}
            setCurrentModal={setCurrentModal}
            setPage={setPage}
            task={schedulingErrorTask}
          ></SchedulingError>
          <ManuallyScheduleTask
            task={schedulingErrorTask}
            isVisible={currentModal === "manuallySchedule"}
            setCurrentModal={setCurrentModal}
            onItemAdded={onItemAdded}
          ></ManuallyScheduleTask>
        </>
      ) : null}
    </View>
  );
}

function BottomLeftNavigation({ setPage, setCurrentModal, onOpenAddItem }) {
  return (
    <View style={style.bottomLeftNavigation}>
      <Pressable style={style.smallButton}>
        <Text style={style.smallButtonAdd} onPress={onOpenAddItem}>
          +
        </Text>
      </Pressable>
      <Pressable
        style={style.smallButton}
        onPress={() => setCurrentModal("manageCalendars")}
      >
        <Image
          style={style.smallButtonIcon}
          source={require("../../assets/calendar_icon64x64.png")}
        ></Image>
      </Pressable>
      <Pressable style={style.smallButton} onPress={() => setPage("Settings")}>
        <Image
          style={style.smallButtonIcon}
          source={require("../../assets/settings_icon64x64.png")}
        ></Image>
      </Pressable>
      <Pressable
        style={style.smallButton}
        onPress={() => setCurrentModal("search")}
      >
        <Image
          style={style.smallButtonIcon}
          source={require("../../assets/search_icon64x64.png")}
        ></Image>
      </Pressable>
    </View>
  );
}

function DatePicker({ currentDate, setCurrentDate }) {
  return (
    <>
      <View style={style.datePickerContainer}>
        <DateTimePicker
          style={style.dailyDatePicker}
          mode={"date"}
          value={currentDate}
          onChange={(_, date) => {
            if (date) {
              // Prevent setting date to undefined/null/
              setCurrentDate(date);
            }
          }}
        ></DateTimePicker>
      </View>
    </>
  );
}

function ManageFloatingTasksButton({ setCurrentModal }) {
  return (
    <Pressable
      onPress={() => setCurrentModal("manageTasks")}
      style={style.bigButton}
    >
      <Text style={style.manageFloatingTasksText}>Manage Floating Tasks</Text>
    </Pressable>
  );
}

const style = StyleSheet.create({
  dailyViewScreen: {
    flexDirection: "column",
    flex: 1, // Expand fully
  },
  mainCalendarContainer: {
    flex: 1, // Expand fully
  },
  bottomBar: {
    flexDirection: "row",
    gap: 10,
    borderStyle: "solid",
    borderTopWidth: 2,
    paddingTop: 7,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomLeftNavigation: {
    flexDirection: "row",
    flexWrap: "wrap", // Make a 2x2 grid of 4 buttons
    gap: 5,
    width: 81, // Make a 2x2 grid 81 = 38+38+5
  },
  smallButton: {
    width: 38, // Define width and height here so all icons are same size
    height: 38, // TODO: Make it responsive for different views. i.e. bigger screens
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 10,
    alignItems: "center", // Horizontal centering
    justifyContent: "center", // Vertical centering
  },
  smallButtonIcon: {
    width: 24,
    height: 24,
  },
  smallButtonAdd: {
    // Align the "+" in the center
    textAlign: "center", // Make sure the + is aligned
    justifyContent: "center",
    alignItems: "center",
    fontSize: 32,
    lineHeight: 33,
  },
  bigButton: {
    width: 91,
    height: 91,
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  manageFloatingTasksText: {
    textAlign: "center",
  },
  datePickerContainer: {
    width: "33%", // TODO: Currently datetime picker has less space to its right than to its left
    alignItems: "center",
    justifyContent: "center",
  },
  dailyDatePicker: {
    transform: [{ scale: 1.25 }], // Date picker does not accept / use width
  },
});
