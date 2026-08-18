import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import type {
  Invite,
  InviteProps,
  InvitesScreenProps,
} from "../../types/calendars";
import { BackButton } from "./CalendarDetailsScreen";
import { styles } from "./calendarStyles";
import { useEffect, useMemo, useState } from "react";
import { checkInvitesToUser, respondToInvite } from "../../api/inviteApi";

// Currently non functional screen to list invites from others -> TODO: May need new backend db table
export function InvitesScreen({
  setCurrentView,
  userId,
  currentView,
  reloadCalendars,
  setReloadCalendars,
}: InvitesScreenProps) {
  const [invites, setInvites] = useState<Invite[]>([]);

  const [reloadInvites, setReloadInvites] = useState(false);

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
  }, [userId, currentView, reloadInvites]);

  // Filter invites for only those with an appropriate status
  const invitesFiltered = useMemo(() => {
    return invites.filter((invite) => invite.status === "open");
  }, [invites]);

  return (
    <>
      <ScrollView>
        <View style={styles.placeholderView}>
          <BackButton setCurrentView={setCurrentView}></BackButton>
          <Text style={[styles.invitesTitle]}>Invites</Text>
        </View>
        <View style={styles.inviteList}>
          {invitesFiltered.map((invite) => (
            <InviteSection
              key={invite.invite_id}
              invite={invite}
              reload={reloadInvites}
              setReload={setReloadInvites}
              reloadCalendars={reloadCalendars}
              setReloadCalendars={setReloadCalendars}
            ></InviteSection>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

function InviteSection({
  invite,
  reload,
  setReload,
  reloadCalendars,
  setReloadCalendars,
}: InviteProps) {
  return (
    <>
      <View style={styles.inviteSection}>
        <Text style={styles.inviteCalendarName}>Calendar Name</Text>
        <Text style={styles.inviteUserName}>Invited by Name</Text>
        <Pressable
          style={styles.inviteAcceptButton}
          onPress={() => {
            handleResponse(
              invite.invite_to_user_id,
              invite.invite_id,
              true,
              reload,
              setReload,
              reloadCalendars,
              setReloadCalendars,
            );
          }}
        >
          <Text style={styles.inviteAcceptText}>Accept</Text>
        </Pressable>
        <Pressable
          style={styles.inviteDeclineButton}
          onPress={() => {
            handleResponse(
              invite.invite_to_user_id,
              invite.invite_id,
              false,
              reload,
              setReload,
              reloadCalendars,
              setReloadCalendars,
            );
          }}
        >
          <Text style={styles.inviteDeclineText}>Decline</Text>
        </Pressable>
      </View>
    </>
  );
}

async function handleResponse(
  userId: number,
  inviteId: number,
  accepted: boolean,
  reload: boolean,
  setReload: (reload: boolean) => void,
  reloadCalendars: boolean,
  setReloadCalendars: (reloadCalendars: boolean) => void,
) {
  const result = await respondToInvite(userId, inviteId, accepted);

  if (!result.success) {
    if (result.error) {
      Alert.alert(result.error);
    } else {
      Alert.alert("Failed responding to invite", "Please try again");
    }
  } else {
    Alert.alert("Successfully responded to invite");
    setReload(!reload);
    setReloadCalendars(!reloadCalendars);
    return;
  }
}
