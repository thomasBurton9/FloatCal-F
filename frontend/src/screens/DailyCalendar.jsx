import { Text, View, StyleSheet, Pressable, Image } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";

// Calendar at the top
// Then bottombar 1/5th or 1/6th

export default function DailyCalendar({ setPage }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  return (
    <>
      <Text>Calendar Page</Text>
      <CalendarView></CalendarView>
      <BottomBar
        setPage={setPage}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
      ></BottomBar>
    </>
  );
}

function CalendarView() {
  return <></>;
}

function BottomBar({ setPage, currentDate, setCurrentDate }) {
  return (
    <View style={style.bottomBar}>
      <BottomLeftNavigation setPage={setPage}></BottomLeftNavigation>
      <DatePicker
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
      ></DatePicker>
      <ManageFloatingTasksButton></ManageFloatingTasksButton>
    </View>
  );
}

function BottomLeftNavigation({ setPage }) {
  return (
    <View style={style.bottomLeftNavigation}>
      <Pressable style={style.smallButton}>
        <Text style={style.smallButtonAdd}>+</Text>
      </Pressable>
      <Pressable style={style.smallButton}>
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
      <Pressable style={style.smallButton}>
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
              // Prevent setting date to undefined/null
              setCurrentDate(date);
            }
          }}
        ></DateTimePicker>
      </View>
    </>
  );
}

function ManageFloatingTasksButton() {
  return (
    <Pressable style={style.bigButton}>
      <Text style={style.manageFloatingTasksText}>Manage Floating Tasks</Text>
    </Pressable>
  );
}

const style = StyleSheet.create({
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
