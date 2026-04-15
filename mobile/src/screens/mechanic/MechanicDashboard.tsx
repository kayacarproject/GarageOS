import React, { useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl, TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore';
import { useJobCardStore } from '../../stores/jobCardStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { useDrawer } from '../../components/CustomDrawer';
import { StatCard } from '../../components/common/StatCard';
import { JobCardListItem } from '../../components/job/JobCardListItem';
import { EmptyState } from '../../components/common/EmptyState';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

const COMPLETED_STATUSES = new Set(['work_completed', 'qc_passed', 'invoiced', 'paid', 'delivered']);
const ACTIVE_STATUSES    = new Set(['assigned', 'in_progress', 'waiting_parts', 'qc_failed']);

export const MechanicDashboard: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { jobCards, fetchByMechanic, isLoading } = useJobCardStore();
  const { unreadCount } = useNotificationStore();
  const { toggleDrawer } = useDrawer();

  const mechanicId = user?.id ?? 'u3';

  useEffect(() => { fetchByMechanic(mechanicId); }, [mechanicId]);

  // ─── Derived (memoized) ────────────────────────────────────────────────────

  const inProgress = useMemo(() => jobCards.filter(j => j.status === 'in_progress'), [jobCards]);
  const waiting    = useMemo(() => jobCards.filter(j => j.status === 'waiting_parts'), [jobCards]);
  const completed  = useMemo(() => jobCards.filter(j => COMPLETED_STATUSES.has(j.status as string)), [jobCards]);
  const activeJobs = useMemo(() => jobCards.filter(j => ACTIVE_STATUSES.has(j.status as string)), [jobCards]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} >
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => fetchByMechanic(mechanicId)} />}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.menuBtn} onPress={toggleDrawer} activeOpacity={0.8}>
          <Ionicons name="menu-outline" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <View style={s.headerLeft}>
          <Text style={s.greeting}>{greeting} 👋</Text>
          <Text style={s.name}>{user?.name ?? 'Mechanic'}</Text>
          <Text style={s.sub}>My Workspace</Text>
        </View>
        <TouchableOpacity
          style={s.notifBtn}
          onPress={() => navigation.navigate('Notifications')}
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
          {unreadCount > 0 && (
            <View style={s.notifBadge}>
              <Text style={s.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── KPI Cards ── */}
      <View style={s.statsRow}>
        <StatCard
          label="In Progress"
          value={String(inProgress.length)}
          icon="play-circle-outline"
          iconColor={COLORS.info}
          iconBg={COLORS.infoLight}
          style={s.stat}
        />
        <StatCard
          label="Waiting Parts"
          value={String(waiting.length)}
          icon="cube-outline"
          iconColor={COLORS.warning}
          iconBg={COLORS.warningLight}
          style={s.stat}
        />
      </View>
      <View style={s.statsRow}>
        <StatCard
          label="Completed"
          value={String(completed.length)}
          icon="checkmark-circle-outline"
          iconColor={COLORS.success}
          iconBg={COLORS.successLight}
          style={s.stat}
        />
        <StatCard
          label="Total Assigned"
          value={String(jobCards.length)}
          icon="construct-outline"
          iconColor={COLORS.primary}
          iconBg={COLORS.primaryLight}
          style={s.stat}
        />
      </View>

      {/* ── Active Jobs ── */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>My Active Jobs</Text>
        {activeJobs.length > 0 && (
          <View style={s.countPill}>
            <Text style={s.countPillText}>{activeJobs.length}</Text>
          </View>
        )}
      </View>

      {activeJobs.length === 0 ? (
        <EmptyState
          title="No active jobs"
          message="You have no jobs assigned right now. Check back soon."
          icon="construct-outline"
        />
      ) : (
        activeJobs.map(job => (
          <JobCardListItem
            key={job.id}
            jobCard={job}
            onPress={() => navigation.navigate('JobWork', { jobCardId: job.id })}
          />
        ))
      )}

      {/* ── Completed Jobs (collapsed summary) ── */}
      {completed.length > 0 && (
        <>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Completed</Text>
          </View>
          <TouchableOpacity
            style={s.completedSummary}
            onPress={() => navigation.navigate('Jobs')}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={s.completedText}>{completed.length} job{completed.length > 1 ? 's' : ''} completed</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.background },
  content:         { padding: SPACING.md, paddingBottom: 100 },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.lg },
  headerLeft:      { flex: 1 ,marginStart:20},
  greeting:        { fontSize: FONT.sizes.sm, color: COLORS.textSecondary },
  name:            { fontSize: FONT.sizes.xl, fontWeight: '700', color: COLORS.text, marginTop: 2 },
  sub:             { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  menuBtn:        { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },
  notifBtn:        { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },
  notifBadge:      { position: 'absolute', top: 6, right: 6, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  notifBadgeText:  { fontSize: 9, color: '#fff', fontWeight: '800' },
  statsRow:        { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  stat:            { flex: 1 },
  sectionHeader:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  sectionTitle:    { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  countPill:       { backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
  countPillText:   { fontSize: FONT.sizes.xs, color: COLORS.primary, fontWeight: '700' },
  completedSummary:{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOW.sm },
  completedText:   { flex: 1, fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.success },
});
