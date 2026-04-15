import React from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationStore, AppNotification } from '../../stores/notificationStore';
import { EmptyState } from '../../components/common/EmptyState';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

const NOTIF_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  job_assigned:       'construct-outline',
  estimate_ready:     'document-text-outline',
  payment_received:   'cash-outline',
  qc_failed:          'close-circle-outline',
  waiting_parts:      'cube-outline',
  booking_confirmed:  'calendar-outline',
  work_completed:     'checkmark-circle-outline',
  general:            'notifications-outline',
};

const NOTIF_COLOR: Record<string, string> = {
  job_assigned:       COLORS.primary,
  estimate_ready:     COLORS.warning,
  payment_received:   COLORS.success,
  qc_failed:          COLORS.danger,
  waiting_parts:      COLORS.warning,
  booking_confirmed:  COLORS.info,
  work_completed:     COLORS.success,
  general:            COLORS.textSecondary,
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { notifications, markRead, markAllRead, remove, unreadCount } = useNotificationStore();

  const handlePress = (item: AppNotification) => {
    markRead(item.id);
    if (item.targetScreen) {
      navigation.navigate(item.targetScreen, item.targetParams ?? {});
    }
  };

  const handleLongPress = (item: AppNotification) => {
    Alert.alert('Remove Notification', 'Remove this notification?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => remove(item.id) },
    ]);
  };

  return (
    <View style={s.container}>
      {unreadCount > 0 && (
        <TouchableOpacity style={s.markAllBtn} onPress={markAllRead}>
          <Text style={s.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={s.list}
        renderItem={({ item }) => {
          const color = NOTIF_COLOR[item.type] ?? COLORS.textSecondary;
          const icon  = NOTIF_ICON[item.type]  ?? 'notifications-outline';
          return (
            <TouchableOpacity
              style={[s.card, !item.read && s.cardUnread]}
              onPress={() => handlePress(item)}
              onLongPress={() => handleLongPress(item)}
              activeOpacity={0.8}
            >
              <View style={[s.iconBox, { backgroundColor: color + '18' }]}>
                <Ionicons name={icon} size={20} color={color} />
              </View>
              <View style={s.body}>
                <View style={s.titleRow}>
                  <Text style={[s.title, !item.read && s.titleUnread]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={s.time}>{timeAgo(item.createdAt)}</Text>
                </View>
                <Text style={s.bodyText} numberOfLines={2}>{item.body}</Text>
              </View>
              {!item.read && <View style={s.unreadDot} />}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            title="All caught up"
            message="No notifications right now"
            icon="notifications-outline"
          />
        }
      />
    </View>
  );
};

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.background },
  markAllBtn:  { alignSelf: 'flex-end', margin: SPACING.md, marginBottom: 0, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs },
  markAllText: { fontSize: FONT.sizes.sm, color: COLORS.primary, fontWeight: '600' },
  list:        { padding: SPACING.md, gap: SPACING.sm },
  card:        { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.sm, ...SHADOW.sm },
  cardUnread:  { borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  iconBox:     { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  body:        { flex: 1 },
  titleRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  title:       { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.text, flex: 1 },
  titleUnread: { fontWeight: '700' },
  time:        { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginLeft: SPACING.xs },
  bodyText:    { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, lineHeight: 16 },
  unreadDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
});
