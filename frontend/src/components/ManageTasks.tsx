import { useEffect, useMemo, useState } from "react";
import { Text, Modal, StyleSheet, View, Pressable } from "react-native";
import { fetchCalendars } from "../api/calendarApi";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchTasksInRange } from "../api/itemApi";
import {
  formatDate,
  addMinutesToDateTime,
  extractTime,
} from "../helpers/dateHelpers";
import type {
  ManageTaskProps,
  TaskType,
  Task,
  OrganizedTasks,
  Calendar,
  TaskTypeSwitcherProps,
  ScheduledTaskListProps,
  UnscheduledTaskListProps,
  TaskOnDateProps,
  IndividualTaskRowProps,
} from "../types/manageTasks";
import { Checkbox } from "expo-checkbox";

export default function ManageTasks({
  isVisible,
  setCurrentModal,
  userId,
}: ManageTaskProps) {
  const [tasks, setTasks] = useState<OrganizedTasks>({});
  const [taskType, setTaskType] = useState<TaskType>("Scheduled"); // Scheduled || Unscheduled || Completed
  const [calendars, setCalendars] = useState<Calendar[]>([]); // Need calendars as well to properly colour each task

  useEffect(() => {
    async function loadCalendars() {
      const calendarData = await fetchCalendars(userId);
      setCalendars(calendarData);
    }

    loadCalendars();
  }, [userId]); //  Given calendars don't change in this view, they should not need to be a dependency

  // Currently only loads 30 days worth of data
  useEffect(() => {
    async function loadTasks() {
      const dateIn30Days = new Date();
      dateIn30Days.setDate(dateIn30Days.getDate() + 30);
      const taskData = await fetchTasksInRange(
        userId,
        formatDate(new Date()),
        formatDate(dateIn30Days),
      );
      console.log(taskData);
      setTasks(taskData);
    }

    loadTasks();
  }, [userId, isVisible]); // Depends on tasks given tasks can be changed in this view

  const scheduledTasks: OrganizedTasks = useMemo(() => {
    let tempScheduledTasks: OrganizedTasks = {};

    for (const key of Object.keys(tasks)) {
      tempScheduledTasks[key] = tasks[key].filter(
        (task: Task) => task.scheduled_start,
      );
    }
    return tempScheduledTasks;
  }, [tasks]);

  const unscheduledTasks: OrganizedTasks = useMemo(() => {
    let tempUnscheduledTasks: OrganizedTasks = {};

    for (const key of Object.keys(tasks)) {
      tempUnscheduledTasks[key] = tasks[key].filter(
        (task: Task) => !task.scheduled_start,
      );
    }
    return tempUnscheduledTasks;
  }, [tasks]);

  // TODO: Implement backend + frontend checking for tasks.
  const completedTasks = useMemo(() => {
    return {};
  }, []);

  function currentView() {
    if (taskType === "Scheduled") {
      return (
        <>
          <ScheduledTaskList
            scheduledTasks={scheduledTasks}
            calendars={calendars}
          ></ScheduledTaskList>
        </>
      );
    } else if (taskType === "Unscheduled") {
      return (
        <>
          <UnScheduledTaskList
            unscheduledTasks={unscheduledTasks}
            calendars={calendars}
          ></UnScheduledTaskList>
        </>
      );
    } else {
      return <CompletedTaskList></CompletedTaskList>;
    }
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
          style={styles.manageCalendarsModal}
          edges={["top", "bottom"]}
        >
          <View style={styles.manageCalendarsContainer}>
            <View style={styles.topBar}>
              <Pressable
                style={styles.closeButton}
                onPress={() => setCurrentModal(null)}
              >
                <Text style={styles.closeButtonText}>X</Text>
              </Pressable>
              <Text style={styles.title}>Manage Floating Tasks</Text>
            </View>
            <TaskTypeSwitcher
              taskType={taskType}
              setTaskType={setTaskType}
            ></TaskTypeSwitcher>
            {currentView()}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

function TaskTypeSwitcher({ taskType, setTaskType }: TaskTypeSwitcherProps) {
  return (
    <>
      <View style={styles.taskTypeSwitcher}>
        <Pressable
          /* Use blue colouring when selected, white otherwise */
          style={[
            taskType === "Scheduled"
              ? styles.currentType
              : styles.nonCurrentType,
            styles.taskType,
            styles.scheduledType,
          ]}
          onPress={() => setTaskType("Scheduled")}
        >
          <Text style={styles.taskTypeText}>Scheduled</Text>
        </Pressable>
        <Pressable
          /* Use blue colouring when selected, white otherwise */
          style={[
            taskType === "Unscheduled"
              ? styles.currentType
              : styles.nonCurrentType,
            styles.taskType,
            styles.unscheduledType,
          ]}
          onPress={() => setTaskType("Unscheduled")}
        >
          <Text style={styles.taskTypeText}>Unscheduled</Text>
        </Pressable>
        <Pressable
          /* Use blue colouring when selected, white otherwise */
          style={[
            taskType === "Completed"
              ? styles.currentType
              : styles.nonCurrentType,
            styles.taskType,
            styles.completedType,
          ]}
          onPress={() => setTaskType("Completed")}
        >
          <Text style={styles.taskTypeText}>Completed</Text>
        </Pressable>
      </View>
    </>
  );
}

function ScheduledTaskList({ scheduledTasks }: ScheduledTaskListProps) {
  return (
    <>
      {Object.keys(scheduledTasks).map((key) => {
        return (
          <TasksOnDate
            key={key}
            date={key}
            tasks={scheduledTasks[key]}
          ></TasksOnDate>
        );
      })}
    </>
  );
}

function IndividualTaskRow({ task }: IndividualTaskRowProps) {
  return (
    <View style={styles.individualTaskRowContainer}>
      <View style={styles.taskText}>
        <Text style={styles.taskName}>{task.name}</Text>
        <Text style={styles.taskDuration}>{task.duration_minutes}m</Text>
      </View>

      <Checkbox style={styles.checkbox}></Checkbox>

      <Text style={styles.taskTime}>
        {task.scheduled_start
          ? `${task.scheduled_start.slice(0, 5)}-${extractTime(addMinutesToDateTime(task.date, task.scheduled_start, task.duration_minutes))}`
          : ""}
      </Text>
      {/*Instead of an icon for the drag handle use 3 thin lines*/}
      <View style={styles.dragHandle}>
        <View style={styles.dragHandleLine} />
        <View style={styles.dragHandleLine} />
        <View style={styles.dragHandleLine} />
      </View>
    </View>
  );
}

function TasksOnDate({ date, tasks }: TaskOnDateProps) {
  return (
    <View style={styles.tasksOnDateContainer}>
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>{date}</Text>
        <Text style={styles.reorderHint}>Drag to reorder</Text>{" "}
        {/* Provides users with information on functionality of tasks */}
      </View>

      {tasks.map((task) => (
        <IndividualTaskRow
          key={`${task.calendar_id}:${task.task_id}`} // Using calendar_id:task_id given task_id's can duplicate across calendars
          task={task}
        />
      ))}
    </View>
  );
}
function UnScheduledTaskList({ unscheduledTasks }: UnscheduledTaskListProps) {
  return <></>;
}

function CompletedTaskList() {
  return <></>;
}
const styles = StyleSheet.create({
  individualTaskRowContainer: {
    width: "100%",
    minHeight: 84,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: "#111",
  },
  taskText: {
    flex: 1,
    justifyContent: "flex-start",
  },
  // TODO: Make all these px widths responsive
  taskName: {
    fontSize: 16,
  },
  taskDuration: {
    marginTop: 4,
    fontSize: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    marginHorizontal: 10,
  },
  taskTime: {
    width: 88,
    fontSize: 15,
  },
  dragHandle: {
    width: 36,
    gap: 5,
    marginLeft: 6,
    alignSelf: "center",
  },
  dragHandleLine: {
    height: 3,
    backgroundColor: "#111111",
  },

  tasksOnDateContainer: {
    width: "100%",
    flexDirection: "column",
    marginTop: 18,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 25,
  },
  reorderHint: {
    color: "#aaa",
    fontSize: 17,
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
    gap: 8,
    flex: 1,
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 40,
    padding: 12,
    paddingTop: 0,
  },
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

  // TASK TYPE SWITCHER
  // Styling generally from components/AddItem
  taskTypeSwitcher: {
    // width: "100%",
    flexDirection: "row",
    borderStyle: "solid",
    borderRadius: 10,
    borderWidth: 3,
  },
  currentType: {
    backgroundColor: "blue",
  },
  nonCurrentType: {
    backgroundColor: "white",
  },
  taskType: {
    padding: 10,
    width: 100,
    alignItems: "center", // Center text horizontally,
    justifyContent: "center", // Center text vertically
  },
  taskTypeText: {
    fontSize: 13, // Prevent text from over flowing to next line
  },
  scheduledType: {
    borderTopLeftRadius: 7,
    borderBottomLeftRadius: 7,
    borderRightWidth: 2,
  },
  unscheduledType: {
    // No need for border radius given it is in the middle between 2 other switchers
  },
  completedType: {
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
    borderLeftWidth: 2,
  },
});
