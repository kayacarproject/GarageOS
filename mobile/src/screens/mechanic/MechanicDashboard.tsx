import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl, TouchableOpacity, SafeAreaView,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { Ionicons }       from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore }   from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { useDrawer }      from '../../components/CustomDrawer';
import { jobcardApi, HanaJobCard } from '../../api/jobcardApi';
import { EmptyState }     from '../../components/common/EmptyState';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  open:                 { label: 'New',             color: '#3B82F6', bg: '#EFF6FF', icon: 'clipboard-outline'        },
  assigned:             { label: 'Assigned',        color: '#3B82F6', bg: '#EFF6FF', icon: 'clipboard-outline'        },
  in_progress:          { label: 'In Progress',     color: '#8B5CF6', bg: '#F5F3FF', icon: 'play-circle-outline'      },
  awaiting_approval:    { label: 'Pending Approval',color: '#F59E0B', bg: '#FFFBEB', icon: 'time-outline'             },
  approved_for_invoice: { label: 'Approved',        color: '#10B981', bg: '#ECFDF5', icon: 'checkmark-circle-outline' },
  revision_requested:   { label: 'Needs Revision',  color: '#EF4444', bg: '#FEF2F2', icon: 'refresh-circle-outline'   },
  completed:            { label: 'Completed',       color: '#10B981', bg: '#ECFDF5', icon: 'checkmark-done-outline'   },
  cancelled:            { label: 'Cancelled',       color: '#6B7280', bg: '#F9FAFB', icon: 'close-circle-outline'     },
};

const ACTIVE_STATUSES = new Set([
  'open', 'assigned', 'in_progress',
  'awaiting_approval', 'approved_for_invoice', 'revision_requested',
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const formatDate = (iso?: string) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const cfg = STATUS_CFG[status] ?? { label: status, color: '#6B7280', bg: '#F9FAFB', icon: 'ellipse-outline' };
  return (
    <View style={[pill.wrap, { backgroundColor: cfg.bg }]}>
      <Ionicons name={cfg.icon as any} size={10} color={cfg.color} />
      <Text style={[pill.text, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};
const pill = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  text: { fontSize: 10, fontWeight: '700' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const MechanicDashboard: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user }         = useAuthStore();
  const { unreadCount }  = useNotificationStore();
  const { toggleDrawer } = useDrawer();

  const [jobs,       setJobs]       = useState<HanaJobCard[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const mechanicId = user?.id ?? '';

  const load = useCallback(async () => {
    try {
      const data = await jobcardApi.getByMechanic(mechanicId);
      setJobs(data);
    } catch { /* silent */ }
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mechanicId]);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));
  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, [load]);

  // ── Counts ─────────────────────────────────────────────────────────────────
  const counts = {
    assigned:  jobs.filter(j => j.status === 'assigned' || j.status === 'open').length,
    progress:  jobs.filter(j => j.status === 'in_progress').length,
    pending:   jobs.filter(j => j.status === 'awaiting_approval').length,
    revision:  jobs.filter(j => j.status === 'revision_requested').length,
    completed: jobs.filter(j => j.status === 'completed').length,
  };
  const activeJobs = jobs.filter(j => ACTIVE_STATUSES.has(j.status));
  const totalActive = activeJobs.length;

  const displayName = (user?.legalname ?? user?.name)?.trim() || 'Mechanic';
  const hour        = new Date().getHours();
  const greeting    = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  if (loading && jobs.length === 0) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />
        <View style={s.loadingScreen}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >

        {/* ── Dark Header ── */}
        <View style={s.header}>
          <View style={s.headerTop}>
            <TouchableOpacity style={s.menuBtn} onPress={toggleDrawer} activeOpacity={0.8}>
              <Ionicons name="menu-outline" size={22} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={s.notifBtn}
              onPress={() => navigation.navigate('Notifications')}
              activeOpacity={0.8}
            >
              <Ionicons name="notifications-outline" size={22} color="#fff" />
              {unreadCount > 0 && (
                <View style={s.notifBadge}>
                  <Text style={s.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Avatar + greeting */}
          <View style={s.profileRow}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{getInitials(displayName)}</Text>
            </View>
            <View style={s.profileInfo}>
              <Text style={s.greetingText}>{greeting} 👋</Text>
              <Text style={s.nameText}>{displayName}</Text>
              <View style={s.rolePill}>
                <Ionicons name="construct-outline" size={10} color="#A5B4FC" />
                <Text style={s.roleText}>Mechanic</Text>
              </View>
            </View>
          </View>

          {/* Active jobs summary */}
          <View style={s.summaryCard}>
            <View style={s.summaryLeft}>
              <Text style={s.summaryNum}>{totalActive}</Text>
              <Text style={s.summaryLabel}>Active Jobs</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryRight}>
              <View style={s.summaryItem}>
                <View style={[s.summaryDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={s.summaryItemText}>{counts.pending} Pending</Text>
              </View>
              <View style={s.summaryItem}>
                <View style={[s.summaryDot, { backgroundColor: '#EF4444' }]} />
                <Text style={s.summaryItemText}>{counts.revision} Revision</Text>
              </View>
              <View style={s.summaryItem}>
                <View style={[s.summaryDot, { backgroundColor: '#10B981' }]} />
                <Text style={s.summaryItemText}>{counts.completed} Done</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Stat Row ── */}
        <View style={s.statsRow}>
          <StatCard icon="clipboard-outline"       label="Assigned"    value={counts.assigned}  color="#3B82F6" />
          <StatCard icon="play-circle-outline"     label="In Progress" value={counts.progress}  color="#8B5CF6" />
          <StatCard icon="time-outline"            label="Awaiting"    value={counts.pending}   color="#F59E0B" />
          <StatCard icon="checkmark-done-outline"  label="Completed"   value={counts.completed} color="#10B981" />
        </View>

        {/* ── Revision Alert ── */}
        {counts.revision > 0 && (
          <View style={s.revisionAlert}>
            <View style={s.revisionAlertIcon}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
            </View>
            <View style={s.revisionAlertBody}>
              <Text style={s.revisionAlertTitle}>Revision Required</Text>
              <Text style={s.revisionAlertSub}>
                {counts.revision} job{counts.revision > 1 ? 's' : ''} returned by owner — update and resubmit
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#EF4444" />
          </View>
        )}

        {/* ── My Jobs ── */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>My Jobs</Text>
          {totalActive > 0 && (
            <View style={s.countBadge}>
              <Text style={s.countBadgeText}>{totalActive}</Text>
            </View>
          )}
        </View>

        {activeJobs.length === 0 ? (
          <EmptyState
            title="No active jobs"
            message="You have no jobs assigned right now."
            icon="construct-outline"
          />
        ) : (
          activeJobs.map(job => (
            <View key={job._id} style={{ paddingHorizontal: SPACING.md }}>
              <JobCard job={job} navigation={navigation} onStatusChange={setJobs} />
            </View>
          ))
        )}

        {/* ── Completed ── */}
        {counts.completed > 0 && (
          <TouchableOpacity
            style={s.completedBanner}
            onPress={() => navigation.navigate('Jobs')}
            activeOpacity={0.8}
          >
            <View style={s.completedIcon}>
              <Ionicons name="checkmark-circle" size={22} color="#10B981" />
            </View>
            <View style={s.completedBody}>
              <Text style={s.completedTitle}>Completed Jobs</Text>
              <Text style={s.completedSub}>{counts.completed} job{counts.completed > 1 ? 's' : ''} finished</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

// ─── StatCard ─────────────────────────────────────────────────────────────────

const StatCard: React.FC<{ icon: string; label: string; value: number; color: string }> = ({
  icon, label, value, color,
}) => (
  <View style={[sc.card, { borderTopColor: color }]}>
    <View style={[sc.iconWrap, { backgroundColor: color + '18' }]}>
      <Ionicons name={icon as any} size={16} color={color} />
    </View>
    <Text style={[sc.value, { color }]}>{value}</Text>
    <Text style={sc.label}>{label}</Text>
  </View>
);
const sc = StyleSheet.create({
  card:     { flex: 1, backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 10, alignItems: 'center', gap: 4, ...SHADOW.sm, borderTopWidth: 3 },
  iconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  value:    { fontSize: FONT.sizes.xl, fontWeight: '800' },
  label:    { fontSize: 9, color: COLORS.textSecondary, fontWeight: '600', textAlign: 'center' },
});

// ─── JobCard ──────────────────────────────────────────────────────────────────

const JobCard: React.FC<{
  job: HanaJobCard;
  navigation: any;
  onStatusChange: React.Dispatch<React.SetStateAction<HanaJobCard[]>>;
}> = ({ job, navigation, onStatusChange }) => {
  const [starting, setStarting] = useState(false);

  const cfg        = STATUS_CFG[job.status] ?? STATUS_CFG.assigned;
  const isAssigned = job.status === 'assigned' || job.status === 'open';
  const isPending  = job.status === 'awaiting_approval';
  const isRevision = job.status === 'revision_requested';
  const isApproved = job.status === 'approved_for_invoice';

  const handleStart = async () => {
    setStarting(true);
    try {
      await jobcardApi.updateStatus(job._id, 'in_progress');
      onStatusChange(prev =>
        prev.map(j => j._id === job._id ? { ...j, status: 'in_progress' } : j),
      );
    } catch { /* silent */ }
    finally { setStarting(false); }
  };

  return (
    <TouchableOpacity
      style={[jc.card, { borderLeftColor: cfg.color }]}
      onPress={() => navigation.navigate('HanaJobCardDetail', { id: job._id })}
      activeOpacity={0.85}
    >
      {/* Top row */}
      <View style={jc.top}>
        <View style={jc.topLeft}>
          <Text style={jc.plate}>{job.registrationNumber ?? '—'}</Text>
          <Text style={jc.vehicle}>
            {[job.brand, job.model].filter(Boolean).join(' ') || '—'}
          </Text>
        </View>
        <StatusPill status={job.status} />
      </View>

      {/* Work type */}
      <View style={jc.workRow}>
        <Ionicons name="construct-outline" size={12} color={COLORS.textMuted} />
        <Text style={jc.workText}>{job.workType ?? '—'}</Text>
      </View>

      {/* Status banners */}
      {isPending && (
        <View style={[jc.banner, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
          <Ionicons name="time-outline" size={13} color="#F59E0B" />
          <Text style={[jc.bannerText, { color: '#92400E' }]}>Waiting for owner approval</Text>
        </View>
      )}
      {isRevision && (
        <View style={[jc.banner, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
          <Ionicons name="refresh-circle-outline" size={13} color="#EF4444" />
          <Text style={[jc.bannerText, { color: '#991B1B' }]}>Revision needed — update estimate</Text>
        </View>
      )}
      {isApproved && (
        <View style={[jc.banner, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
          <Ionicons name="checkmark-circle-outline" size={13} color="#10B981" />
          <Text style={[jc.bannerText, { color: '#065F46' }]}>Approved — ready for invoice</Text>
        </View>
      )}

      {/* Footer */}
      <View style={jc.footer}>
        <Text style={jc.jobId}>#{job._id.slice(-6).toUpperCase()}</Text>
        {job.createdAt && (
          <View style={jc.dateRow}>
            <Ionicons name="calendar-outline" size={11} color={COLORS.textMuted} />
            <Text style={jc.dateText}>{formatDate(job.createdAt)}</Text>
          </View>
        )}

        {isAssigned ? (
          <TouchableOpacity
            style={jc.startBtn}
            onPress={handleStart}
            disabled={starting}
            activeOpacity={0.85}
          >
            {starting
              ? <ActivityIndicator size="small" color="#fff" style={{ width: 14, height: 14 }} />
              : <Ionicons name="play-circle" size={14} color="#fff" />
            }
            <Text style={jc.startBtnText}>{starting ? 'Starting…' : 'Start Work'}</Text>
          </TouchableOpacity>
        ) : (
          <View style={jc.viewBtn}>
            <Text style={jc.viewBtnText}>View</Text>
            <Ionicons name="chevron-forward" size={12} color={COLORS.primary} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const jc = StyleSheet.create({
  card:     { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm, borderLeftWidth: 4 },
  top:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  topLeft:  { flex: 1, marginRight: SPACING.sm },
  plate:    { fontSize: FONT.sizes.md, fontWeight: '800', color: COLORS.text, letterSpacing: 0.5 },
  vehicle:  { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  workRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  workText: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary },
  banner:   { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: RADIUS.sm, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 5, marginBottom: 8 },
  bannerText:{ fontSize: FONT.sizes.xs, fontWeight: '600' },
  footer:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  jobId:    { flex: 1, fontSize: FONT.sizes.xs, color: COLORS.textMuted, fontWeight: '700' },
  dateRow:  { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dateText: { fontSize: FONT.sizes.xs, color: COLORS.textMuted },
  startBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primary, borderRadius: RADIUS.sm, paddingVertical: 5, paddingHorizontal: 10 },
  startBtnText: { fontSize: FONT.sizes.xs, fontWeight: '700', color: '#fff' },
  viewBtn:  { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewBtnText: { fontSize: FONT.sizes.xs, fontWeight: '700', color: COLORS.primary },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#1E1B4B' },
  scroll:        { flex: 1, backgroundColor: COLORS.background },
  content:       { paddingBottom: 100 },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Header
  header:      { backgroundColor: '#1E1B4B', paddingHorizontal: SPACING.md, paddingBottom: SPACING.lg, paddingTop: SPACING.sm },
  headerTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  menuBtn:     { width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  notifBtn:    { width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  notifBadge:  { position: 'absolute', top: 6, right: 6, minWidth: 14, height: 14, borderRadius: 7, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  notifBadgeText: { fontSize: 8, color: '#fff', fontWeight: '800' },

  profileRow:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  avatar:      { width: 52, height: 52, borderRadius: 26, backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  avatarText:  { fontSize: FONT.sizes.md, fontWeight: '800', color: '#fff' },
  profileInfo: { flex: 1 },
  greetingText:{ fontSize: FONT.sizes.xs, color: '#A5B4FC' },
  nameText:    { fontSize: FONT.sizes.lg, fontWeight: '800', color: '#fff', marginTop: 1 },
  rolePill:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  roleText:    { fontSize: 10, color: '#A5B4FC', fontWeight: '600' },

  summaryCard:    { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: RADIUS.lg, padding: SPACING.md, flexDirection: 'row', alignItems: 'center' },
  summaryLeft:    { alignItems: 'center', paddingRight: SPACING.md },
  summaryNum:     { fontSize: 36, fontWeight: '800', color: '#fff', lineHeight: 40 },
  summaryLabel:   { fontSize: 10, color: '#A5B4FC', fontWeight: '600', marginTop: 2 },
  summaryDivider: { width: 1, height: 48, backgroundColor: 'rgba(255,255,255,0.2)', marginRight: SPACING.md },
  summaryRight:   { flex: 1, gap: 6 },
  summaryItem:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryDot:     { width: 7, height: 7, borderRadius: 4 },
  summaryItemText:{ fontSize: FONT.sizes.xs, color: '#C7D2FE', fontWeight: '500' },

  // Stats
  statsRow: { flexDirection: 'row', gap: SPACING.xs, paddingHorizontal: SPACING.md, marginTop: -SPACING.sm, marginBottom: SPACING.md },

  // Revision alert
  revisionAlert:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: '#FEF2F2', borderRadius: RADIUS.lg, padding: SPACING.md, marginHorizontal: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: '#FECACA' },
  revisionAlertIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
  revisionAlertBody: { flex: 1 },
  revisionAlertTitle:{ fontSize: FONT.sizes.sm, fontWeight: '700', color: '#991B1B' },
  revisionAlertSub:  { fontSize: FONT.sizes.xs, color: '#B91C1C', marginTop: 1 },

  // Section
  sectionRow:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  sectionTitle:  { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  countBadge:    { backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
  countBadgeText:{ fontSize: FONT.sizes.xs, color: COLORS.primary, fontWeight: '700' },

  // Job cards wrapper
  jobsWrap: { paddingHorizontal: SPACING.md },

  // Completed banner
  completedBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.md, marginHorizontal: SPACING.md, marginTop: SPACING.sm, ...SHADOW.sm },
  completedIcon:   { width: 40, height: 40, borderRadius: 10, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
  completedBody:   { flex: 1 },
  completedTitle:  { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.text },
  completedSub:    { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, marginTop: 1 },
});
