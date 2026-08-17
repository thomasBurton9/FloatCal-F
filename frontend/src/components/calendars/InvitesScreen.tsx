import { Alert, Text, View } from "react-native";
import type { Invite, InvitesScreenProps } from "../../types/calendars";
import { BackButton } from "./CalendarDetailsScreen";
import { styles } from "./calendarStyles";
import { useEffect, useState } from "react";
import { checkInvitesToUser } from "../../api/inviteApi";

// Currently non functional screen to list invites from others -> TODO: May need new backend db table
export function InvitesScreen({
  setCurrentView,
  userId,
  currentView,
}: InvitesScreenProps) {
  const [invites, setInvites] = useState<Invite>(null);

  useEffect(() => {
    async function loadInvites() {
      const inviteData = await checkInvitesToUser(userId);
      if (inviteData.success) {
        setInvites(inviteData.result);
      } else {
        if (inviteData.error) {
          Alert.alert(inviteData.error);
        } else {
          Alert.alert("Error checking invites");
        }
      }
    }
    if (userId && currentView === "invites") {
      loadInvites();
    }
  }, [userId, invites, currentView]);
  return (
    <View style={styles.placeholderView}>
      <BackButton setCurrentView={setCurrentView}></BackButton>
      <Text style={styles.placeholderTitle}>Invites</Text>
    </View>
  );
}
