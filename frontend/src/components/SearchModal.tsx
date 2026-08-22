import {
  Modal,
  Pressable,
  Text,
  View,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { SearchModalProps, SearchResultProps } from "../types/search";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { BLUE_COLOUR } from "../constants";
import { CalendarItem } from "../types/calendarItems";
import { searchItems } from "../api/searchApi";
import { addMinutesToDateTime, formatDateUser } from "../helpers/dateHelpers";

export default function SearchModal({
  isVisible,
  setCurrentModal,
  userId,
  onItemPress,
}: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const [items, setItems] = useState<CalendarItem[]>([]);

  return (
    <>
      <Modal
        transparent
        animationType="slide"
        allowSwipeDismissal={true}
        onRequestClose={() => setCurrentModal(null)}
        visible={isVisible}
      >
        <SafeAreaView edges={["top", "bottom"]} style={styles.searchModal}>
          <View style={styles.searchContainer}>
            <View style={styles.searchTopBar}>
              <Pressable
                style={styles.closeSearchButton}
                onPress={() => {
                  setItems([]); // if the search button is closed the results are removed
                  setCurrentModal(null);
                }}
              >
                <Text style={styles.closeSearchButtonText}>X</Text>
              </Pressable>
              <Text style={styles.searchTitle}>Search</Text>
            </View>
            <View style={styles.searchInputRow}>
              <Image
                source={require("../../assets/search_icon64x64.png")}
                style={styles.searchIcon}
              ></Image>
              <TextInput
                value={searchTerm}
                maxLength={32}
                style={styles.searchInputField}
                onChangeText={(searchTerm: string) => setSearchTerm(searchTerm)}
                placeholder={"Search events, tasks and notes"}
              ></TextInput>
            </View>
            <Pressable
              onPress={async () => {
                const searchResult = await searchItems(userId, searchTerm);

                if (!searchResult.success) {
                  if (searchResult.error) {
                    Alert.alert(searchResult.error);
                  } else {
                    Alert.alert("Error searching for items");
                  }
                } else {
                  if (searchResult.result.length === 0) {
                    Alert.alert("No matching items found");
                  }
                  setItems(searchResult.result);
                }
              }}
              style={styles.searchButton}
            >
              <Text>Search</Text>
            </Pressable>
            <ScrollView>
              <View style={styles.searchResults}>
                {items.map((item) => (
                  <SearchResult
                    key={`${item.calendar_id}:${"task_id" in item ? item.task_id + "t" : item.event_id + "e"}`}
                    item={item}
                    onPress={() => onItemPress(item)}
                  ></SearchResult>
                ))}
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

function SearchResult({ item, onPress }: SearchResultProps) {
  const isTask = "duration_minutes" in item;
  return (
    <>
      <Pressable style={styles.individualItem} onPress={onPress}>
        <View style={styles.resultHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemType}>{isTask ? "Task" : "Event"}</Text>
        </View>

        <Text style={styles.itemSchedule}>{formatDateAndTime(item)}</Text>
        <Text style={styles.itemDuration}>Calendar: {item.calendar_name}</Text>
      </Pressable>
    </>
  );
}

function formatDateAndTime(item: CalendarItem): string {
  const isTask = "duration_minutes" in item;
  const date = formatDateUser(item.date, "short");

  if (isTask) {
    if (!item.scheduled_start) {
      return `${date}: Not Scheduled`;
    }

    // Returns YYYY-MM-DDTHH:MM:SS
    // Slice for HH:MM
    const endTime = addMinutesToDateTime(
      item.date,
      item.scheduled_start,
      item.duration_minutes,
    ).slice(11, 16);

    return `${date}: ${item.scheduled_start.slice(0, 5)} - ${endTime}`;
  }

  return `${date}: ${item.start_time.slice(0, 5)} - ${item.end_time.slice(0, 5)}`;
}
// Initial styles copied from @calendarStyles.ts
const styles = StyleSheet.create({
  searchModal: {
    paddingBottom: 0,
    marginBottom: 0,
    flex: 1,
    paddingTop: 40,
    backgroundColor: "rgba(0, 0, 0, 0.12)",
  },
  searchContainer: {
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
  searchTopBar: {
    width: "100%",
    alignSelf: "center",
    position: "relative",
    height: 55,
    justifyContent: "center",
    marginBottom: 20,
  },
  closeSearchButton: {
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
  closeSearchButtonText: {
    textAlign: "center",
    fontSize: 22,
    lineHeight: 30,
  },
  searchTitle: {
    fontSize: 27,
    textAlign: "center",
  },
  searchInputField: {},
  searchIcon: {
    width: 24,
    height: 24,
  },
  searchInputRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 10,
    borderStyle: "solid",
    borderRadius: 10,
    borderWidth: 1.5,
  },
  searchButton: {
    backgroundColor: BLUE_COLOUR,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    marginVertical: 10,
    borderStyle: "solid",
    borderRadius: 10,
    borderWidth: 1,
  },

  // SEARCH RESULTS

  searchResults: {
    gap: 5,
    flexDirection: "column",
  },

  individualItem: {
    padding: 10,
    borderRadius: 10,
    borderStyle: "solid",
    borderWidth: 1.5,
    flexDirection: "column",
    gap: 3,
  },

  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemType: {
    borderColor: "#ADD8E6", // Light blue
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: "solid",
    padding: 5,
    minWidth: 50,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    backgroundColor: "#C2E5F299", // Lighter blue with lower opacity
    color: "#3D7894", // Darker blue
  },
  itemName: {
    fontSize: 20,
  },
  itemSchedule: {
    fontSize: 14,
  },
  itemDuration: {
    fontSize: 14,
  },
});
