import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  deleteButton: {
    color: "#FF0000FF",
    backgroundColor: "#FF0000FF",
    padding: 10,
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 10,
  },
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
