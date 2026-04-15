import React, { useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { useJobCardStore } from '../../stores/jobCardStore';
import { useBookingStore } from '../../stores/bookingStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { StatCard } from '../../components/common/StatCard';
import { JobCardListItem } from '../../components/job/JobCardListItem';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/currency';
import { useDrawer } from '../../components/CustomDrawer';
import { useInvoiceStore } from '../../stores/invoiceStore';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{
  title: string;
  badge?: number;
  onSeeAll?: () => void;
}> = ({ title, badge, onSeeAll }) => (
  <View style={s.sectionHeader}>
    <View style={s.sectionLeft}>
      <Text style={s.sectionTitle}>{title}</Text>
      {!!badge && (
        <View style={s.badge}>
          <Text style={s.badgeText}>{badge}</Text>
        </View>
      )}
    </View>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={s.seeAll}>See all</Text>
      </TouchableOpacity>
    )}
  </View>
);

const PendingPaymentRow: React.FC<{
  invoiceNumber: string;
  jobNumber: string;
  balanceDue: number;
  onPress: () => void;
}> = ({ invoiceNumber, jobNumber, balanceDue, onPress }) => (
  <TouchableOpacity style={s.paymentRow} onPress={onPress} activeOpacity={0.8}>
    <View style={s.paymentLeft}>
      <Text style={s.paymentInvoice}>{invoiceNumber}</Text>
      <Text style={s.paymentJob}>{jobNumber}</Text>
    </View>
    <View style={s.paymentRight}>
      <Text style={s.paymentBalance}>{formatCurrency(balanceDue)}</Text>
      <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
    </View>
  </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const OwnerDashboard: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, company } = useAuthStore();
  const { jobCards, fetchAll, isLoading } = useJobCardStore();
  const { bookings, fetchAll: fetchBookings } = useBookingStore();
  const { unreadCount } = useNotificationStore();
  const { invoices, load: loadInvoices } = useInvoiceStore();
  const { toggleDrawer } = useDrawer();

  useEffect(() => { fetchAll(); fetchBookings(); loadInvoices(); }, []);

  const onRefresh = () => { fetchAll(); fetchBookings(); loadInvoices(); };

  // ─── Derived data (memoized) ───────────────────────────────────────────────

  const needsApproval = useMemo(
    () => jobCards.filter(j => j.status === 'estimate_created'),
    [jobCards],
  );

  const activeJobs = useMemo(
    () => jobCards.filter(j => j.status === 'in_progress' || j.status === 'waiting_parts'),
    [jobCards],
  );

  const pendingInvoices = useMemo(
    () => invoices.filter(i => !i.is_locked && i.balance_due > 0),
    [invoices],
  );

  const todayBookings = useMemo(() => bookings, [bookings]);

  // ─── KPI calculations ──────────────────────────────────────────────────────

  const totalPendingBalance = useMemo(
    () => pendingInvoices.reduce((sum, i) => sum + i.balance_due, 0),
    [pendingInvoices],
  );

  const revenueToday = useMemo(() => {
    const today = new Date().toDateString();
    return invoices
      .filter(i => i.is_locked && i.issued_at && new Date(i.issued_at).toDateString() === today)
      .reduce((sum, i) => sum + i.total, 0);
  }, [invoices]);

  const revenueMonth = useMemo(() => {
    const now = new Date();
    return invoices
      .filter(i => {
        if (!i.is_locked || !i.issued_at) return false;
        const d = new Date(i.issued_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, i) => sum + i.total, 0);
  }, [invoices]);

  // ─── Greeting ─────────────────────────────────────────────────────────────

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>

    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.menuBtn}
          onPress={toggleDrawer}
          activeOpacity={0.8}
        >
          <Ionicons name="menu-outline" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <View style={s.headerLeft}>
          <Text style={s.greeting}>{greeting} 👋</Text>
          <Text style={s.name}>{user?.name}</Text>
          <Text style={s.company}>{company?.name} · {dateStr}</Text>
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

      {/* ── Revenue KPIs ── */}
      <View style={s.statsRow}>
        <StatCard
          label="Revenue Today"
          value={formatCurrency(revenueToday)}
          icon="cash-outline"
          iconColor={COLORS.success}
          iconBg={COLORS.successLight}
          style={s.stat}
        />
        <StatCard
          label="This Month"
          value={formatCurrency(revenueMonth)}
          icon="bar-chart-outline"
          iconColor={COLORS.primary}
          iconBg={COLORS.primaryLight}
          style={s.stat}
        />
      </View>

      {/* ── Operational KPIs ── */}
      <View style={s.statsRow}>
        <StatCard
          label="Active Jobs"
          value={String(activeJobs.length)}
          icon="construct-outline"
          iconColor={COLORS.info}
          iconBg={COLORS.infoLight}
          style={s.stat}
        />
        <StatCard
          label="Pending Payment"
          value={totalPendingBalance > 0 ? formatCurrency(totalPendingBalance) : '—'}
          icon="alert-circle-outline"
          iconColor={totalPendingBalance > 0 ? COLORS.danger : COLORS.textMuted}
          iconBg={totalPendingBalance > 0 ? COLORS.dangerLight : '#F3F4F6'}
          style={s.stat}
        />
      </View>

      <View style={s.statsRow}>
        <StatCard
          label="Bookings Today"
          value={String(todayBookings.length)}
          icon="calendar-outline"
          iconColor={COLORS.warning}
          iconBg={COLORS.warningLight}
          style={s.stat}
        />
        <StatCard
          label="Needs Approval"
          value={String(needsApproval.length)}
          icon="checkmark-circle-outline"
          iconColor={needsApproval.length > 0 ? COLORS.danger : COLORS.success}
          iconBg={needsApproval.length > 0 ? COLORS.dangerLight : COLORS.successLight}
          style={s.stat}
        />
      </View>

      {/* ── Needs Approval ── */}
      <SectionHeader
        title="Needs Approval"
        badge={needsApproval.length}
        onSeeAll={() => navigation.navigate('Approvals')}
      />
      {needsApproval.length === 0 ? (
        <Text style={s.emptyNote}>No estimates pending approval ✓</Text>
      ) : (
        needsApproval.slice(0, 3).map(j => (
          <TouchableOpacity
            key={j.id}
            style={s.approvalCard}
            onPress={() => navigation.navigate('JobCardDetail', { id: j.id })}
            activeOpacity={0.8}
          >
            <View style={s.approvalLeft}>
              <Text style={s.approvalJob}>{j.job_number}</Text>
              <Text style={s.approvalVehicle}>
                {(j.vehicle as any)?.brand ?? ''} {j.vehicle?.model} · {(j.vehicle as any)?.registration_number}
              </Text>
              <Text style={s.approvalCustomer}>{j.customer?.name ?? j.vehicle?.customer?.name}</Text>
            </View>
            <View style={s.approvalRight}>
              <View style={s.approvalPill}>
                <Text style={s.approvalPillText}>Estimate Ready</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={{ marginTop: 4 }} />
            </View>
          </TouchableOpacity>
        ))
      )}

      {/* ── Active / Overdue Jobs ── */}
      <SectionHeader
        title="Active & Overdue Jobs"
        badge={activeJobs.length}
        onSeeAll={() => navigation.navigate('Jobs')}
      />
      {activeJobs.length === 0 ? (
        <EmptyState title="No active jobs" message="All jobs are up to date" icon="checkmark-circle-outline" />
      ) : (
        activeJobs.slice(0, 4).map(job => (
          <JobCardListItem
            key={job.id}
            jobCard={job}
            onPress={() => navigation.navigate('JobCardDetail', { id: job.id })}
          />
        ))
      )}

      {/* ── Pending Payments ── */}
      {pendingInvoices.length > 0 && (
        <>
          <SectionHeader
            title="Pending Payments"
            badge={pendingInvoices.length}
            onSeeAll={() => navigation.navigate('Revenue')}
          />
          <View style={s.pendingCard}>
            {pendingInvoices.map((inv, idx) => {
              const job = jobCards.find(j => j.id === inv.job_card_id);
              return (
                <React.Fragment key={inv.id}>
                  {idx > 0 && <View style={s.rowDivider} />}
                  <PendingPaymentRow
                    invoiceNumber={inv.invoice_number}
                    jobNumber={job?.job_number ?? inv.job_card_id}
                    balanceDue={inv.balance_due}
                    onPress={() => navigation.navigate('Payment', { jobCardId: inv.job_card_id, invoiceId: inv.id })}
                  />
                </React.Fragment>
              );
            })}
          </View>
        </>
      )}
    </ScrollView>

    {/* ── Create Job Card FAB ── */}
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
  container:        { flex: 1, backgroundColor: COLORS.background },
  content:          { padding: SPACING.md, paddingBottom: 100 },

  // Header
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.lg },
  headerLeft:       { flex: 1,marginStart:20 },
  greeting:         { fontSize: FONT.sizes.sm, color: COLORS.textSecondary },
  name:             { fontSize: FONT.sizes.xl, fontWeight: '700', color: COLORS.text, marginTop: 2 },
  company:          { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  notifBtn:         { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },
  menuBtn:          { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },
  notifBadge:       { position: 'absolute', top: 6, right: 6, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  notifBadgeText:   { fontSize: 9, color: '#fff', fontWeight: '800' },

  // Stats
  statsRow:         { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  stat:             { flex: 1 },

  // Section header
  sectionHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.lg, marginBottom: SPACING.sm },
  sectionLeft:      { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  sectionTitle:     { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  badge:            { backgroundColor: COLORS.danger, minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeText:        { fontSize: FONT.sizes.xs, color: '#fff', fontWeight: '800' },
  seeAll:           { fontSize: FONT.sizes.sm, color: COLORS.primary, fontWeight: '600' },
  emptyNote:        { fontSize: FONT.sizes.sm, color: COLORS.textMuted, textAlign: 'center', paddingVertical: SPACING.md },

  // Approval card
  approvalCard:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm, borderLeftWidth: 3, borderLeftColor: COLORS.warning },
  approvalLeft:     { flex: 1 },
  approvalJob:      { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.text },
  approvalVehicle:  { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  approvalCustomer: { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 1 },
  approvalRight:    { alignItems: 'flex-end' },
  approvalPill:     { backgroundColor: COLORS.warningLight, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  approvalPillText: { fontSize: FONT.sizes.xs, color: COLORS.warning, fontWeight: '700' },

  // Pending payments
  pendingCard:      { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOW.sm, marginBottom: SPACING.sm },
  paymentRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md },
  paymentLeft:      { flex: 1 },
  paymentInvoice:   { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.text },
  paymentJob:       { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  paymentRight:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  paymentBalance:   { fontSize: FONT.sizes.md, fontWeight: '800', color: COLORS.danger },
  rowDivider:       { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.md },
  fab:              { position: 'absolute', bottom: 28, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },
});
