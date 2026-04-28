import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons }         from '@expo/vector-icons';
import { revenueApi, RevenueRawData } from '../../api/revenueApi';
import type { HanaPayment } from '../../api/paymentApi';
import type { HanaInvoice } from '../../api/invoiceApi';
import type { HanaJobCard } from '../../api/jobcardApi';
import {
  Period,
  computeMetrics,
  getPeriodLabel,
  formatINR,
} from '../../utils/revenueUtils';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIODS: { key: Period; label: string }[] = [
  { key: 'today', label: 'Today'      },
  { key: 'week',  label: 'This Week'  },
  { key: 'month', label: 'This Month' },
];

const MODE_ICON: Record<string, any> = {
  cash:          'cash-outline',
  upi:           'phone-portrait-outline',
  bank_transfer: 'business-outline',
  cheque:        'document-text-outline',
};

const MODE_LABEL: Record<string, string> = {
  cash:          'Cash',
  upi:           'UPI',
  bank_transfer: 'Bank Transfer',
  cheque:        'Cheque',
};

const EMPTY_RAW: RevenueRawData = { payments: [], invoices: [], jobcards: [] };

// ─── Screen ───────────────────────────────────────────────────────────────────

export const RevenueScreen: React.FC = () => {
  const [period, setPeriod] = useState<Period>('month');
  const [raw,    setRaw]    = useState<RevenueRawData>(EMPTY_RAW);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await revenueApi.fetchAll();
      setRaw(data);
    } catch {
      // Keep last known data on error; screens shows ₹0 gracefully
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // All maths done in-memory — switching tabs is instant
  const metrics = useMemo(
    () => computeMetrics(raw.payments, raw.invoices, raw.jobcards, period),
    [raw, period],
  );

  const { totalRevenue, pendingCollections, growthPercent, breakdown, jobStats } = metrics;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={s.loadingScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={s.loadingText}>Loading revenue data…</Text>
      </View>
    );
  }

  const growthPositive = growthPercent >= 0;

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
    >
      {/* ── Period Filter ── */}
      <View style={s.periodRow}>
        {PERIODS.map(p => (
          <TouchableOpacity
            key={p.key}
            style={[s.periodChip, period === p.key && s.periodActive]}
            onPress={() => setPeriod(p.key)}
          >
            <Text style={[s.periodText, period === p.key && s.periodTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Revenue Card ── */}
      <View style={s.revenueCard}>
        <Text style={s.revenueLabel}>Total Revenue</Text>
        <Text style={s.revenueValue}>{formatINR(totalRevenue)}</Text>
        {totalRevenue === 0 ? (
          <Text style={s.noDataNote}>No payments yet</Text>
        ) : (
          <View style={s.revenueSub}>
            <Ionicons
              name={growthPositive ? 'trending-up' : 'trending-down'}
              size={14}
              color={growthPositive ? '#86efac' : '#fca5a5'}
            />
            <Text style={s.revenueSubText}>
              {growthPositive ? '+' : ''}{growthPercent}% vs {getPeriodLabel(period)}
            </Text>
          </View>
        )}
      </View>

      {/* ── Pending Collections ── */}
      <View style={[s.pendingCard, pendingCollections > 0 && s.pendingAlert]}>
        <View style={s.pendingLeft}>
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color={pendingCollections > 0 ? COLORS.danger : COLORS.textMuted}
          />
          <Text style={[s.pendingLabel, pendingCollections > 0 && s.pendingLabelAlert]}>
            Pending Collections
          </Text>
        </View>
        <Text style={[s.pendingValue, pendingCollections > 0 && s.pendingValueAlert]}>
          {formatINR(pendingCollections)}
        </Text>
      </View>

      {/* ── Payment Breakdown ── */}
      <Text style={s.sectionTitle}>Payment Breakdown</Text>

      {breakdown.length === 0 ? (
        <View style={s.emptyCard}>
          <Ionicons name="bar-chart-outline" size={32} color={COLORS.border} />
          <Text style={s.emptyText}>No payments in this period</Text>
        </View>
      ) : (
        breakdown.map(({ mode, amount, percent }) => (
          <View key={mode} style={s.modeCard}>
            <View style={s.modeIcon}>
              <Ionicons name={MODE_ICON[mode] ?? 'card-outline'} size={18} color={COLORS.primary} />
            </View>
            <Text style={s.modeName}>
              {MODE_LABEL[mode] ?? mode.replace(/_/g, ' ').toUpperCase()}
            </Text>
            <View style={s.modeBar}>
              <View style={[s.modeBarFill, { width: `${Math.min(percent, 100)}%` as any }]} />
            </View>
            <Text style={s.modeAmount}>{formatINR(amount)}</Text>
          </View>
        ))
      )}

      {/* ── Job Statistics ── */}
      <Text style={s.sectionTitle}>Job Statistics</Text>

      {jobStats.total === 0 ? (
        <View style={s.emptyCard}>
          <Ionicons name="construct-outline" size={32} color={COLORS.border} />
          <Text style={s.emptyText}>No jobs in this period</Text>
        </View>
      ) : (
        <View style={s.jobStatsGrid}>
          {([
            { label: 'Total Jobs',  value: jobStats.total,      color: COLORS.primary },
            { label: 'Completed',   value: jobStats.completed,  color: COLORS.success },
            { label: 'In Progress', value: jobStats.inProgress, color: COLORS.info    },
            { label: 'Pending',     value: jobStats.pending,    color: COLORS.warning },
          ] as const).map(stat => (
            <View key={stat.label} style={s.jobStatCard}>
              <Text style={[s.jobStatValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={s.jobStatLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content:   { padding: SPACING.md, paddingBottom: 100 },

  // Loading
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.background },
  loadingText:   { fontSize: FONT.sizes.sm, color: COLORS.textMuted },

  // Period tabs
  periodRow:       { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.md },
  periodChip:      { flex: 1, paddingVertical: 8, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border },
  periodActive:    { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  periodText:      { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.textSecondary },
  periodTextActive:{ color: '#fff' },

  // Revenue hero card
  revenueCard:    { backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.sm, alignItems: 'center' },
  revenueLabel:   { fontSize: FONT.sizes.sm, color: 'rgba(255,255,255,0.8)', marginBottom: SPACING.xs },
  revenueValue:   { fontSize: 40, fontWeight: '800', color: '#fff', marginBottom: SPACING.xs },
  revenueSub:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  revenueSubText: { fontSize: FONT.sizes.sm, color: 'rgba(255,255,255,0.9)' },
  noDataNote:     { fontSize: FONT.sizes.sm, color: 'rgba(255,255,255,0.7)' },

  // Pending card
  pendingCard:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOW.sm },
  pendingAlert:      { backgroundColor: COLORS.dangerLight, borderWidth: 1, borderColor: COLORS.danger + '40' },
  pendingLeft:       { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  pendingLabel:      { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.textSecondary },
  pendingLabelAlert: { color: COLORS.danger },
  pendingValue:      { fontSize: FONT.sizes.lg, fontWeight: '700', color: COLORS.text },
  pendingValueAlert: { color: COLORS.danger },

  // Section header
  sectionTitle: { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm, marginTop: SPACING.sm },

  // Payment breakdown
  modeCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.xs, gap: SPACING.sm, ...SHADOW.sm },
  modeIcon:    { width: 36, height: 36, borderRadius: 8, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  modeName:    { fontSize: FONT.sizes.xs, fontWeight: '700', color: COLORS.text, width: 80 },
  modeBar:     { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  modeBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  modeAmount:  { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.text, width: 70, textAlign: 'right' },

  // Job stats
  jobStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  jobStatCard:  { flex: 1, minWidth: '45%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', ...SHADOW.sm },
  jobStatValue: { fontSize: FONT.sizes.xxl, fontWeight: '800' },
  jobStatLabel: { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, marginTop: 4 },

  // Empty state
  emptyCard: { alignItems: 'center', paddingVertical: SPACING.lg, gap: SPACING.sm, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, marginBottom: SPACING.xs },
  emptyText: { fontSize: FONT.sizes.sm, color: COLORS.textMuted },
});
