import {
  NestableScrollContainer,
  NestableDraggableFlatList,
} from "react-native-draggable-flatlist";
import { UnscheduledTaskListProps } from "../../types/manageTasks";
import { useState, useEffect, useMemo } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { Checkbox } from "expo-checkbox";

import type {
  TaskOnDateProps,
  IndividualTaskRowProps,
} from "../../types/manageTasks";
import { handleTaskComplete } from "../../helpers/completionLog";

// Largely copied from ScheduledTasks.tsx -> ScheduledTaskList
// Due to similar logic, code and styling
export function UnScheduledTaskList({
  unscheduledTasks,
  calendars,
  onTaskPress,
}: UnscheduledTaskListProps) {
  const [orderedTasks, setOrderedTasks] = useState(unscheduledTasks); // Allow for the drag functionality to change the order of tasks -> Currently non functional in terms of actually choosing times
  useEffect(() => {
    setOrderedTasks(unscheduledTasks);
  }, [unscheduledTasks]);

  const sortedDates = useMemo(
    // Backend does not provide tasks that are sorted by date
    // Therefore the dates need to be sorted to be outputted correctly
    () => Object.keys(orderedTasks).sort((a, b) => a.localeCompare(b)), // Use a string compare method given YYYY-MM-DD format is alphabetical
    [orderedTasks],
  );

  return (
    <NestableScrollContainer
      style={styles.unScheduledTaskScroll}
      contentContainerStyle={styles.unScheduledTaskContent}
    >
      {sortedDates.map((date) => (
        <TasksOnDate
          key={date}
          date={date}
          tasks={orderedTasks[date]}
          onReorder={(data) => {
            setOrderedTasks((currentTasks) => ({
              ...currentTasks, // Keep all other tasks
              [date]: data, // But change the one that got reordered
            }));
          }}
          onTaskPress={onTaskPress}
        ></TasksOnDate>
      ))}
    </NestableScrollContainer>
  );
}

function TasksOnDate({ date, tasks, onReorder, onTaskPress }: TaskOnDateProps) {
  return (
    <View style={styles.tasksOnDateContainer}>
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>{date}</Text>
        <Text style={styles.reorderHint}>Drag to reorder</Text>
        {/* Provides users with information on functionality of tasks */}
      </View>

      <NestableDraggableFlatList
        data={tasks}
        scrollEnabled={false}
        keyExtractor={(task) => `${task.calendar_id}:${task.task_id}`}
        renderItem={({ item, drag }) => (
          <IndividualTaskRow
            task={item}
            drag={drag}
            onTaskPress={onTaskPress}
          />
        )}
        onDragEnd={({ data }) => onReorder(data)}
      />
    </View>
  );
}

function IndividualTaskRow({
  task,
  drag,
  onTaskPress,
}: IndividualTaskRowProps) {
  // Basically identical checkbox logic as ScheduledTasks
  const [completedStatus, setCompletedStatus] = useState(task.completed);

  useEffect(() => {
    setCompletedStatus(task.completed);
  }, [task.completed]);
  return (
    <View style={styles.individualTaskRowContainer}>
      <Pressable style={styles.taskText} onPress={() => onTaskPress(task)}>
        <Text style={styles.taskName}>{task.name}</Text>
        <Text style={styles.taskDuration}>{task.duration_minutes}m</Text>
      </Pressable>
      {/* Currently not fully functional TODO:*/}
      <Checkbox
        value={completedStatus}
        onValueChange={async (value) => {
          // On failure roll back change -> save previous state to allow this
          const initialStatus = completedStatus;
          setCompletedStatus(value);

          const result = await handleTaskComplete(
            value,
            task.task_id,
            task.date,
          );

          if (!result.success) {
            setCompletedStatus(initialStatus);
          }
        }}
        disabled={false}
        style={styles.checkbox}
      ></Checkbox>
      {/* Format time in HH:MM-HH:MM */}
      {/* Potentially replace ScheduledTask start time -> end time with suggested start time??*/}
      {/* Or button to schedule task */}
      {/*<Text style={styles.taskTime}>
        {task.scheduled_start
          ? `${task.scheduled_start.slice(0, 5)}-${extractTime(addMinutesToDateTime(task.date, task.scheduled_start, task.duration_minutes))}`
          : ""}
      </Text>*/}
      {/*Instead of an icon for the drag handle use 3 thin lines*/}
      {/*TODO: Potentially change to icon if current implementation can be improved*/}
      {/*Only initialise dragging upon holding the 3 lines*/}
      <Pressable
        style={styles.dragHandle}
        onLongPress={drag}
        delayLongPress={200}
      >
        <View style={styles.dragHandleLine} />
        <View style={styles.dragHandleLine} />
        <View style={styles.dragHandleLine} />
      </Pressable>
    </View>
  );
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
  unScheduledTaskScroll: {
    width: "100%",
  },
  unScheduledTaskContent: {
    paddingBottom: 20,
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
    color: "#aaa", // Grey -> #aaa == #aaaaaa
    fontSize: 17,
  },
});
