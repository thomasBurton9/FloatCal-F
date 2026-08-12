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

// Calendar at the top
// Then bottombar 1/5th or 1/6th
// TODO: Add theme for calendar
export default function DailyCalendar({ setPage, userId }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentModal, setCurrentModal] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // Current selected item -> Used for task info popup
  const [returnModal, setReturnModal] = useState(null);

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
            setSelectedItem(item);
            setCurrentModal("itemInfo");
          }}
          setReturnModal={setReturnModal}
        ></CalendarView>
        <BottomBar
          setPage={setPage}
          userId={userId}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          onItemPress={(item) => {
            setSelectedItem(item);
            setCurrentModal("itemInfo");
          }}
          currentModal={currentModal}
          setCurrentModal={setCurrentModal}
          onItemAdded={() => setItemAddedTrigger(!itemAddedTrigger)}
          setReturnModal={setReturnModal}
        ></BottomBar>
        <ItemInfoModal
          isVisible={currentModal === "itemInfo"}
          item={selectedItem}
          setCurrentModal={(modal) => {
            setCurrentModal(modal);
            if (modal === null) {
              setSelectedItem(null);
            }
          }}
          returnModal={returnModal}
          setReturnModal={setReturnModal}
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
        const length = baseColour.length; // Should be 9 ideally
        const r = parseInt(baseColour.slice(1, 3), 16); // As these are hexcodes we decode them in base 16
        const g = parseInt(baseColour.slice(3, 5), 16);
        const b = parseInt(baseColour.slice(5, 7), 16);
        let a;
        if (length === 9) {
          a = baseColour.slice(7, 9); //Slice till the end
        }

        function lightenAndConvert(colourValue) {
          let newColour = Math.round(colourValue + (255 - colourValue) * 0.3); // Lighten floating tasks by 20% -> not my formula
          newColour = newColour.toString(16).padStart(2, "0");
          return newColour;
        }
        baseColour = `#${lightenAndConvert(r)}${lightenAndConvert(g)}${lightenAndConvert(b)}${a ? a : "FF"}`;
      } else {
        baseColour = "#FF0000FF";
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
        color: baseColour, // TODO: Modify colour based on type of task
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
        color: getCalendarColour(calendars, item["calendar_id"]) || "#FF0000FF",
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
  setReturnModal,
}) {
  return (
    <>
      <View style={style.mainCalendarContainer}>
        <CalendarContainer
          ref={calendarRef}
          numberOfDays={1}
          scrollByDay={true}
          firstDay={7}
          allowDragToCreate={true}
          allowDragToEdit={true} // TODO: Implement the event handlers
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
      {schedulingErrorTask ? (
        <SchedulingError
          isVisible={currentModal === "schedulingError"}
          setCurrentModal={setCurrentModal}
          setPage={setPage}
          task={schedulingErrorTask}
        ></SchedulingError>
      ) : null}
    </View>
  );
}

function BottomLeftNavigation({ setPage, setCurrentModal }) {
  return (
    <View style={style.bottomLeftNavigation}>
      <Pressable style={style.smallButton}>
        <Text
          style={style.smallButtonAdd}
          onPress={() => setCurrentModal("addItem")}
        >
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
    fontSize: 28,
    lineHeight: 28,
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
