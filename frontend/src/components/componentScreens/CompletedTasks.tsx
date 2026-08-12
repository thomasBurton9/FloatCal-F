import type { CompletedTaskListProps } from "../../types/manageTasks";
import { useEffect, useState, useMemo } from "react";
import { StyleSheet } from "react-native";
import { NestableScrollContainer } from "react-native-draggable-flatlist";
import { TasksOnDate } from "./ScheduledTasks";

// TODO: Current formatting uses the scheduledTask function copied to here for all tasks scheduled or unscheduled
// This can result in slighty weird formatting, with a floating checkbox,
// Though it could just be intended, given it looks potentially better

export function CompletedTaskList({
  completedTasks,
  calendars,
  onTaskPress,
  onStateUpdate,
}: CompletedTaskListProps) {
  const [orderedTasks, setOrderedTasks] = useState(completedTasks); // Allow for the drag functionality to change the order of tasks -> Currently non functional in terms of actually choosing times

  useEffect(() => {
    setOrderedTasks(completedTasks);
  }, [completedTasks]);

  const sortedDates = useMemo(
    // Backend does not provide tasks that are sorted by date
    // Therefore the dates need to be sorted to be outputted correctly
    () => Object.keys(orderedTasks).sort((a, b) => a.localeCompare(b)), // Use a string compare method given YYYY-MM-DD format is alphabetical
    [orderedTasks],
  );
  return (
    <>
      <NestableScrollContainer
        style={styles.scheduledTaskScroll} // Styling for the actual visualised part of container -> e.g. 500px by 500px
        contentContainerStyle={styles.scheduledTaskContent} // Styling for the inner "infinite scroll view"
      >
        {sortedDates.map((date) => (
          <TasksOnDate
            key={date}
            date={date}
            tasks={orderedTasks[date]}
            onReorder={(data) =>
              setOrderedTasks((currentTasks) => ({
                ...currentTasks,
                [date]: data,
              }))
            }
            onTaskPress={onTaskPress}
            onStateUpdate={onStateUpdate}
          ></TasksOnDate>
        ))}
      </NestableScrollContainer>
    </>
  );
}

const styles = StyleSheet.create({
  scheduledTaskScroll: {
    width: "100%",
  },
  scheduledTaskContent: {
    paddingBottom: 20,
  },
});
