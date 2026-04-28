import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore }        from '../../stores/authStore';
import { useHanaJobCardStore } from '../../stores/hanaJobCardStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { EmptyState }          from '../../components/common/EmptyState';
import { ApprovalCard }        from '../../components/common/ApprovalCard';
import { formatCurrency }      from '../../utils/currency';
import { useDrawer }           from '../../components/CustomDrawer';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';
import { estimateApi, HanaEstimate } from '../../api/estimateApi';
import { dashboardApi, DashboardRevenue } from '../../api/dashboardApi';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  open:        { label: 'Open',        color: COLORS.warning, bg: COLORS.warningLight },
  in_progress: { label: 'In Progress', color: COLORS.info,    bg: COLORS.infoLight    },
  completed:   { label: 'Completed',   color: COLORS.success, bg: COLORS.successLight },
  cancelled:   { label: 'Cancelled',   color: COLORS.danger,  bg: COLORS.dangerLight  },
};

// ─── Quick actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { icon: 'add-circle-outline' as const, label: 'New Job',  screen: 'CreateJobCard',   color: COLORS.primary, bg: COLORS.primaryLight },
  { icon: 'car-outline'        as const, label: 'Vehicle',  screen: 'AddVehicle',      color: COLORS.info,    bg: COLORS.infoLight    },
  { icon: 'people-outline'     as const, label: 'Mechanic', screen: 'HanaAddMechanic', color: COLORS.success, bg: COLORS.successLight },
  { icon: 'bar-chart-outline'  as const, label: 'Reports',  screen: 'Revenue',         color: COLORS.warning, bg: COLORS.warningLight },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{
  title: string;
  badge?: number;
  onSeeAll?: () => void;
}> = ({ title, badge, onSeeAll }) => (
  <View style={s.sectionHeader}>
    <View style={s.sectionLeft}>
      <Text style={s.sectionTitle}>{title}</Text>
      {!!badge && badge > 0 && (
        <View style={s.badge}>
          <Text style={s.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
    </View>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={s.seeAll}>See all</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const OwnerDashboard: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, company } = useAuthStore();
  const { jobCards: hanaJobCards, fetchAll: fetchHanaJobCards } = useHanaJobCardStore();
  const { unreadCount } = useNotificationStore();
  const { toggleDrawer } = useDrawer();

  const [approvals, setApprovals]             = useState<HanaEstimate[]>([]);
  const [approvalsLoading, setApprovalsLoading] = useState(false);
  const [processingId, setProcessingId]       = useState<string | null>(null);
  const [refreshing, setRefreshing]           = useState(false);

  // ─── Revenue KPIs — fetched live from Hana invoice module ────────────────

  const [revenue, setRevenue] = useState<DashboardRevenue>({
    revenueToday: 0, revenueMonth: 0, pendingPayments: 0, pendingPaymentCount: 0,
  });

  const { revenueToday, revenueMonth, pendingPayments } = revenue;

  // ─── Job card KPIs (Hana MongoDB jobcard module) ─────────────────────────

  const { jobTotal, jobActive, jobCompleted } = useMemo(() => ({
    jobTotal:     hanaJobCards.length,
    jobActive:    hanaJobCards.filter(j => j.status === 'open' || j.status === 'in_progress').length,
    jobCompleted: hanaJobCards.filter(j => j.status === 'completed').length,
  }), [hanaJobCards]);

  // ─── Recent 5 job cards (newest first) ───────────────────────────────────

  const recentJobs = useMemo(
    () =>
      [...hanaJobCards]
        .sort((a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
        )
        .slice(0, 5),
    [hanaJobCards],
  );

  // ─── Greeting ─────────────────────────────────────────────────────────────

  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr   = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  const ownerName = (user?.legalname ?? user?.name)?.trim() || 'Owner';

  // ─── Data loading ─────────────────────────────────────────────────────────

  const loadRevenue = useCallback(async () => {
    try {
      const data = await dashboardApi.getRevenue();
      setRevenue(data);
    } catch {
      // Silent — revenue stays at zero if the API is unavailable
    }
  }, []);

  const loadApprovals = useCallback(async () => {
    setApprovalsLoading(true);
    try {
      const data = await estimateApi.getPendingApprovals();
      setApprovals(data);
    } catch {
      // Silent fail — show empty state if estimate module unavailable
    } finally {
      setApprovalsLoading(false);
    }
  }, []);

  const loadAll = useCallback(() => {
    fetchHanaJobCards();
    loadRevenue();
    loadApprovals();
  }, [fetchHanaJobCards, loadRevenue, loadApprovals]);

  useEffect(() => { loadAll(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([
      fetchHanaJobCards(),
      loadRevenue(),
      loadApprovals(),
    ]);
    setRefreshing(false);
  }, [fetchHanaJobCards, loadRevenue, loadApprovals]);

  // ─── Approval handlers ────────────────────────────────────────────────────

  const handleApprove = async (a: HanaEstimate) => {
    if (processingId) return;
    setProcessingId(a._id);
    try {
      await estimateApi.approve(a._id, user?.id ?? '');
      setApprovals(prev => prev.filter(x => x._id !== a._id));
      Alert.alert('Approved ✓', 'The estimate has been approved successfully.');
    } catch {
      Alert.alert('Error', 'Could not approve. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = (a: HanaEstimate) => {
    Alert.alert(
      'Reject Estimate',
      'Are you sure you want to reject this estimate?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(a._id);
            try {
              await estimateApi.reject(a._id, user?.id ?? '');
              setApprovals(prev => prev.filter(x => x._id !== a._id));
            } catch {
              Alert.alert('Error', 'Could not reject. Please try again.');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ],
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >

        {/* ══════════════════════════════════════════════
            HEADER
            ══════════════════════════════════════════════ */}
        <View style={s.header}>
          {/* Decorative circles for depth */}
          <View style={s.decor1} />
          <View style={s.decor2} />

          {/* Top row: menu | name | notifications */}
          <View style={s.headerRow}>
            <TouchableOpacity style={s.iconBtn} onPress={toggleDrawer} activeOpacity={0.8}>
              <Ionicons name="menu-outline" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={s.headerCenter}>
              <Text style={s.greetingText}>{greeting} 👋</Text>
              <Text style={s.ownerNameText} numberOfLines={1}>{ownerName}</Text>
            </View>

            <TouchableOpacity
              style={s.iconBtn}
              onPress={() => navigation.navigate('Notifications')}
              activeOpacity={0.8}
            >
              <Ionicons name="notifications-outline" size={22} color="#fff" />
              {unreadCount > 0 && (
                <View style={s.notifDot}>
                  <Text style={s.notifDotText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Meta pills: date + company */}
          <View style={s.headerMeta}>
            <View style={s.metaPill}>
              <Ionicons name="calendar-outline" size={11} color="rgba(255,255,255,0.85)" />
              <Text style={s.metaText}>{dateStr}</Text>
            </View>
            {!!company?.name && (
              <View style={s.metaPill}>
                <Ionicons name="business-outline" size={11} color="rgba(255,255,255,0.85)" />
                <Text style={s.metaText} numberOfLines={1}>{company.name}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ══════════════════════════════════════════════
            BODY  (white card rising from header)
            ══════════════════════════════════════════════ */}
        <View style={s.body}>

          {/* ── REVENUE HERO CARD ── */}
          <TouchableOpacity
            style={s.revenueCard}
            onPress={() => navigation.navigate('Revenue')}
            activeOpacity={0.9}
          >
            <View style={s.revenueCardDecor} />
            <View style={s.revenueCardHeader}>
              <View style={s.revenueCardIconBox}>
                <Ionicons name="trending-up-outline" size={15} color={COLORS.primary} />
              </View>
              <Text style={s.revenueCardHeading}>Revenue Overview</Text>
              <Ionicons name="chevron-forward" size={15} color={COLORS.textMuted} />
            </View>
            <View style={s.revenueCardBody}>
              <View style={s.revenueHalf}>
                <Text style={s.revenueHalfLabel}>Today</Text>
                <Text style={s.revenueHalfValue}>{formatCurrency(revenueToday)}</Text>
                <View style={s.revenueBadge}>
                  <Ionicons name="sunny-outline" size={10} color={COLORS.success} />
                  <Text style={s.revenueBadgeText}>Today's earnings</Text>
                </View>
              </View>
              <View style={s.revenueSep} />
              <View style={s.revenueHalf}>
                <Text style={s.revenueHalfLabel}>This Month</Text>
                <Text style={[s.revenueHalfValue, { color: COLORS.primary }]}>{formatCurrency(revenueMonth)}</Text>
                <View style={[s.revenueBadge, { backgroundColor: COLORS.primaryLight }]}>
                  <Ionicons name="calendar-outline" size={10} color={COLORS.primary} />
                  <Text style={[s.revenueBadgeText, { color: COLORS.primary }]}>Monthly total</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* ── METRICS LIST CARD ── */}
          <View style={s.metricsCard}>
            {([
              {
                icon:    'construct-outline' as const,
                label:   'Active Jobs',
                value:   String(jobActive),
                color:   COLORS.info,
                bg:      COLORS.infoLight,
                onPress: () => navigation.navigate('HanaJobCards', { filter: 'active' }),
              },
              {
                icon:    'shield-checkmark-outline' as const,
                label:   'Pending Approvals',
                value:   String(approvals.length),
                color:   approvals.length > 0 ? COLORS.warning : COLORS.success,
                bg:      approvals.length > 0 ? COLORS.warningLight : COLORS.successLight,
                onPress: undefined as (() => void) | undefined,
              },
              {
                icon:    'checkmark-done-outline' as const,
                label:   'Completed Jobs',
                value:   String(jobCompleted),
                color:   COLORS.success,
                bg:      COLORS.successLight,
                onPress: () => navigation.navigate('HanaJobCards', { filter: 'completed' }),
              },
              {
                icon:    'wallet-outline' as const,
                label:   'Pending Payments',
                value:   pendingPayments > 0 ? formatCurrency(pendingPayments) : '—',
                color:   pendingPayments > 0 ? COLORS.danger : COLORS.textMuted,
                bg:      pendingPayments > 0 ? COLORS.dangerLight : '#F3F4F6',
                onPress: pendingPayments > 0 ? () => navigation.navigate('Revenue') : undefined,
              },
            ] as const).map((item, idx, arr) => (
              <React.Fragment key={item.label}>
                <TouchableOpacity
                  style={s.metricRow}
                  onPress={item.onPress}
                  activeOpacity={item.onPress ? 0.72 : 1}
                  disabled={!item.onPress}
                >
                  <View style={[s.metricIconBox, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon} size={18} color={item.color} />
                  </View>
                  <Text style={s.metricLabel}>{item.label}</Text>
                  <Text style={[s.metricValue, { color: item.color }]}>{item.value}</Text>
                  {item.onPress && (
                    <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                  )}
                </TouchableOpacity>
                {idx < arr.length - 1 && <View style={s.metricDivider} />}
              </React.Fragment>
            ))}
          </View>

          {/* ── QUICK ACTIONS ── */}
          <View style={s.quickCard}>
            <Text style={s.quickCardTitle}>Quick Actions</Text>
            <View style={s.quickRow}>
              {QUICK_ACTIONS.map(({ icon, label, screen, color, bg }) => (
                <TouchableOpacity
                  key={label}
                  style={s.quickItem}
                  onPress={() => navigation.navigate(screen)}
                  activeOpacity={0.75}
                >
                  <View style={[s.quickIcon, { backgroundColor: bg }]}>
                    <Ionicons name={icon} size={22} color={color} />
                  </View>
                  <Text style={s.quickLabel}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── PENDING APPROVALS ── */}
          <SectionHeader
            title="Pending Approvals"
            badge={approvals.length}
            onSeeAll={approvals.length > 3 ? () => navigation.navigate('Approvals') : undefined}
          />

          {approvalsLoading ? (
            <ActivityIndicator color={COLORS.primary} style={s.loader} />
          ) : approvals.length === 0 ? (
            <View style={s.emptyApprovals}>
              <Ionicons name="checkmark-circle" size={36} color={COLORS.success} />
              <Text style={s.emptyApprovalsText}>All caught up — no pending approvals</Text>
            </View>
          ) : (
            approvals.slice(0, 5).map(a => (
              <ApprovalCard
                key={a._id}
                approval={{
                  _id:             a._id,
                  type:            'estimate',
                  title:           a.vehicleName ?? a.registrationNumber ?? 'Estimate',
                  description:     `₹${(a.total || 0).toLocaleString('en-IN')} · ${a.items.length} item${a.items.length !== 1 ? 's' : ''}`,
                  referenceId:     a.jobcardId,
                  requestedByName: a.createdBy,
                  status:          'pending',
                  createdAt:       a.createdAt,
                }}
                processing={processingId === a._id}
                onApprove={() => handleApprove(a)}
                onReject={() => handleReject(a)}
                onViewDetails={
                  a.jobcardId
                    ? () => navigation.navigate('HanaJobCardDetail', { id: a.jobcardId })
                    : undefined
                }
              />
            ))
          )}

          {/* ── RECENT JOB CARDS ── */}
          <SectionHeader
            title="Recent Job Cards"
            badge={jobTotal}
            onSeeAll={() => navigation.navigate('HanaJobCards', { filter: 'all' })}
          />

          {recentJobs.length === 0 ? (
            <EmptyState
              title="No job cards yet"
              message="Create a new job card to get started"
              icon="document-text-outline"
            />
          ) : (
            recentJobs.map(job => {
              const cfg = STATUS_CFG[job.status] ?? STATUS_CFG.open;
              return (
                <TouchableOpacity
                  key={job._id}
                  style={[s.jobRow, { borderLeftColor: cfg.color }]}
                  onPress={() => navigation.navigate('HanaJobCardDetail', { id: job._id })}
                  activeOpacity={0.8}
                >
                  <View style={s.jobLeft}>
                    <Text style={s.jobPlate}>{job.registrationNumber ?? '—'}</Text>
                    <Text style={s.jobMeta}>
                      {[job.brand, job.model].filter(Boolean).join(' ')}
                      {job.workType ? ` · ${job.workType}` : ''}
                    </Text>
                    {!!job.createdAt && (
                      <Text style={s.jobTime}>
                        {new Date(job.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short',
                        })}
                      </Text>
                    )}
                  </View>
                  <View style={s.jobRight}>
                    <View style={[s.statusPill, { backgroundColor: cfg.bg }]}>
                      <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                    {job.estimatedTotal != null && (
                      <Text style={s.jobAmount}>{formatCurrency(job.estimatedTotal)}</Text>
                    )}
                    <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                  </View>
                </TouchableOpacity>
              );
            })
          )}

        </View>
      </ScrollView>

      {/* ── FAB — create new job card ── */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('CreateJobCard')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 110, flexGrow: 1 },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    backgroundColor:  COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingTop:        Platform.OS === 'android' ? SPACING.xl : SPACING.sm,
    paddingBottom:     SPACING.xl + 4,
    overflow:          'hidden',
  },
  // Decorative translucent circles behind header content
  decor1: {
    position:        'absolute',
    right:           -40,
    top:             -40,
    width:           200,
    height:          200,
    borderRadius:    100,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  decor2: {
    position:        'absolute',
    left:            -25,
    bottom:          -55,
    width:           150,
    height:          150,
    borderRadius:    75,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  headerRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            SPACING.sm,
    marginBottom:   SPACING.md,
  },
  iconBtn: {
    width:           42,
    height:          42,
    borderRadius:    21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  headerCenter: { flex: 1 },
  greetingText: {
    fontSize:   FONT.sizes.sm,
    color:      'rgba(255,255,255,0.85)',
    fontWeight: '400',
  },
  ownerNameText: {
    fontSize:   FONT.sizes.xl,
    fontWeight: '700',
    color:      '#fff',
    marginTop:  1,
  },
  notifDot: {
    position:         'absolute',
    top:              7,
    right:            7,
    minWidth:         15,
    height:           15,
    borderRadius:     8,
    backgroundColor:  COLORS.danger,
    alignItems:       'center',
    justifyContent:   'center',
    paddingHorizontal: 2,
  },
  notifDotText: { fontSize: 9, color: '#fff', fontWeight: '800' },

  headerMeta: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           SPACING.sm,
  },
  metaPill: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             4,
    backgroundColor: 'rgba(255,255,255,0.13)',
    paddingHorizontal: 10,
    paddingVertical:   4,
    borderRadius:    RADIUS.full,
  },
  metaText: {
    fontSize:   FONT.sizes.xs,
    color:      'rgba(255,255,255,0.92)',
    fontWeight: '500',
  },

  // ── Body (white sheet rising from header) ─────────────────────────────────
  body: {
    backgroundColor:      COLORS.background,
    borderTopLeftRadius:  RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    marginTop:            -RADIUS.xl,
    paddingTop:           SPACING.lg,
    paddingHorizontal:    SPACING.md,
    flexGrow:             1,          // fills remaining scroll height → no blue gap
    paddingBottom:        SPACING.xl,
  },

  // ── Revenue hero card ──────────────────────────────────────────────────────
  revenueCard: {
    backgroundColor: COLORS.surface,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.md,
    marginBottom:    SPACING.sm,
    borderWidth:     1,
    borderColor:     COLORS.primaryLight,
    overflow:        'hidden',
    ...SHADOW.sm,
  },
  revenueCardDecor: {
    position:        'absolute',
    right:           -24,
    top:             -24,
    width:           110,
    height:          110,
    borderRadius:    55,
    backgroundColor: COLORS.primaryLight,
    opacity:         0.45,
  },
  revenueCardHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            SPACING.xs,
    marginBottom:   SPACING.md,
  },
  revenueCardIconBox: {
    width:           26,
    height:          26,
    borderRadius:    RADIUS.xs,
    backgroundColor: COLORS.primaryLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  revenueCardHeading: {
    flex:          1,
    fontSize:      FONT.sizes.xs,
    fontWeight:    '700',
    color:         COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  revenueCardBody: {
    flexDirection: 'row',
    alignItems:    'stretch',
  },
  revenueHalf: {
    flex:       1,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  revenueHalfLabel: {
    fontSize:     FONT.sizes.xs,
    color:        COLORS.textMuted,
    fontWeight:   '500',
    marginBottom: 4,
  },
  revenueHalfValue: {
    fontSize:     FONT.sizes.xxl,
    fontWeight:   '800',
    color:        COLORS.text,
    marginBottom: 6,
  },
  revenueBadge: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             3,
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:    RADIUS.full,
  },
  revenueBadgeText: {
    fontSize:   FONT.sizes.xs,
    color:      COLORS.success,
    fontWeight: '600',
  },
  revenueSep: {
    width:           1,
    backgroundColor: COLORS.border,
    marginVertical:  SPACING.xs,
  },

  // ── Metrics list card ──────────────────────────────────────────────────────
  metricsCard: {
    backgroundColor: COLORS.surface,
    borderRadius:    RADIUS.lg,
    marginBottom:    SPACING.sm,
    overflow:        'hidden',
    ...SHADOW.sm,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.sm,
    padding:       SPACING.md,
  },
  metricIconBox: {
    width:          38,
    height:         38,
    borderRadius:   RADIUS.sm,
    alignItems:     'center',
    justifyContent: 'center',
  },
  metricLabel: {
    flex:       1,
    fontSize:   FONT.sizes.sm,
    color:      COLORS.text,
    fontWeight: '500',
  },
  metricValue: {
    fontSize:   FONT.sizes.md,
    fontWeight: '800',
    marginRight: 2,
  },
  metricDivider: {
    height:           1,
    backgroundColor:  COLORS.border,
    marginHorizontal: SPACING.md,
  },

  // ── Quick actions card ─────────────────────────────────────────────────────
  quickCard: {
    backgroundColor: COLORS.surface,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.md,
    marginBottom:    SPACING.md,
    ...SHADOW.sm,
  },
  quickCardTitle: {
    fontSize:        FONT.sizes.xs,
    fontWeight:      '700',
    color:           COLORS.textSecondary,
    textTransform:   'uppercase',
    letterSpacing:   0.6,
    marginBottom:    SPACING.sm,
  },
  quickRow:  { flexDirection: 'row', justifyContent: 'space-between' },
  quickItem: { flex: 1, alignItems: 'center', gap: 6 },
  quickIcon: {
    width:          50,
    height:         50,
    borderRadius:   RADIUS.md,
    alignItems:     'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize:   FONT.sizes.xs,
    color:      COLORS.textSecondary,
    fontWeight: '600',
    textAlign:  'center',
  },

  // ── Section header ─────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginTop:      SPACING.md,
    marginBottom:   SPACING.sm,
  },
  sectionLeft:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  sectionTitle: { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  badge: {
    backgroundColor:  COLORS.danger,
    minWidth:         20,
    height:           20,
    borderRadius:     10,
    alignItems:       'center',
    justifyContent:   'center',
    paddingHorizontal: 5,
  },
  badgeText: { fontSize: FONT.sizes.xs, color: '#fff', fontWeight: '800' },
  seeAll:    { fontSize: FONT.sizes.sm, color: COLORS.primary, fontWeight: '600' },

  // ── Empty / loader states ──────────────────────────────────────────────────
  loader: { marginVertical: SPACING.md },
  emptyApprovals: {
    alignItems:      'center',
    gap:             SPACING.sm,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius:    RADIUS.lg,
    marginBottom:    SPACING.sm,
    ...SHADOW.sm,
  },
  emptyApprovalsText: {
    fontSize:  FONT.sizes.sm,
    color:     COLORS.textMuted,
    textAlign: 'center',
  },

  // ── Job card rows ─────────────────────────────────────────────────────────
  jobRow: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    backgroundColor: COLORS.surface,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.md,
    marginBottom:    SPACING.sm,
    borderLeftWidth: 3,
    ...SHADOW.sm,
  },
  jobLeft:   { flex: 1, marginRight: SPACING.sm },
  jobPlate:  { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  jobMeta:   { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  jobTime:   { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 3 },
  jobRight:  { alignItems: 'flex-end', gap: 4 },
  jobAmount: { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.text },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  statusText: { fontSize: FONT.sizes.xs, fontWeight: '700' },

  // ── FAB ───────────────────────────────────────────────────────────────────
  fab: {
    position:        'absolute',
    bottom:          28,
    right:           20,
    width:           56,
    height:          56,
    borderRadius:    28,
    backgroundColor: COLORS.primary,
    alignItems:      'center',
    justifyContent:  'center',
    ...SHADOW.md,
  },
});
