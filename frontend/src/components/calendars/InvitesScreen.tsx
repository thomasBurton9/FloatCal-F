import { Text, View } from "react-native";
import type { InvitesScreenProps } from "../../types/calendars";
import { BackButton } from "./CalendarDetailsScreen";
import { styles } from "./calendarStyles";

// Currently non functional screen to list invites from others -> TODO: May need new backend db table
export function InvitesScreen({ setCurrentView }: InvitesScreenProps) {
  return (
    <View style={styles.placeholderView}>
      <BackButton setCurrentView={setCurrentView}></BackButton>
      <Text style={styles.placeholderTitle}>Invites</Text>
    </View>
  );
}
