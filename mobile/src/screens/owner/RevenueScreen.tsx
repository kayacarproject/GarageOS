import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dummyPayments } from '../../dummy/payments';
import { dummyInvoices } from '../../dummy/invoices';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

type Period = 'today' | 'week' | 'month';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week',  label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

const MODE_ICON: Record<string, any> = {
  cash: 'cash-outline',
  upi: 'phone-portrait-outline',
  bank_transfer: 'business-outline',
  cheque: 'document-text-outline',
};

export const RevenueScreen: React.FC = () => {
  const [period, setPeriod] = useState<Period>('month');

  const totalRevenue = dummyPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = dummyInvoices
    .filter(i => i.status !== 'paid' && i.status !== 'PAID')
    .reduce((sum, i) => sum + (i.balance_due ?? i.total), 0);

  const byMode = dummyPayments.reduce<Record<string, number>>((acc, p) => {
    if (p.status === 'completed') acc[p.mode] = (acc[p.mode] ?? 0) + p.amount;
    return acc;
  }, {});

  const jobStats = {
    total: 4,
    completed: 1,
    inProgress: 2,
    pending: 1,
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Period Filter */}
      <View style={s.periodRow}>
        {PERIODS.map(p => (
          <TouchableOpacity
            key={p.key}
            style={[s.periodChip, period === p.key && s.periodActive]}
            onPress={() => setPeriod(p.key)}
          >
            <Text style={[s.periodText, period === p.key && s.periodTextActive]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Revenue Card */}
      <View style={s.revenueCard}>
        <Text style={s.revenueLabel}>Total Revenue</Text>
        <Text style={s.revenueValue}>₹{totalRevenue.toLocaleString('en-IN')}</Text>
        <View style={s.revenueSub}>
          <Ionicons name="trending-up" size={14} color={COLORS.success} />
          <Text style={s.revenueSubText}>+12% vs last {period}</Text>
        </View>
      </View>

      {/* Pending */}
      <View style={[s.pendingCard, pendingAmount > 0 && s.pendingAlert]}>
        <View style={s.pendingLeft}>
          <Ionicons name="alert-circle-outline" size={20} color={pendingAmount > 0 ? COLORS.danger : COLORS.textMuted} />
          <Text style={[s.pendingLabel, pendingAmount > 0 && s.pendingLabelAlert]}>Pending Collections</Text>
        </View>
        <Text style={[s.pendingValue, pendingAmount > 0 && s.pendingValueAlert]}>
          ₹{pendingAmount.toLocaleString('en-IN')}
        </Text>
      </View>

      {/* Payment Breakdown */}
      <Text style={s.sectionTitle}>Payment Breakdown</Text>
      {Object.entries(byMode).map(([mode, amount]) => (
        <View key={mode} style={s.modeCard}>
          <View style={s.modeIcon}>
            <Ionicons name={MODE_ICON[mode] ?? 'card-outline'} size={18} color={COLORS.primary} />
          </View>
          <Text style={s.modeName}>{mode.replace('_', ' ').toUpperCase()}</Text>
          <View style={s.modeBar}>
            <View style={[s.modeBarFill, { width: `${Math.min((amount / totalRevenue) * 100, 100)}%` }]} />
          </View>
          <Text style={s.modeAmount}>₹{amount.toLocaleString('en-IN')}</Text>
        </View>
      ))}

      {/* Job Stats */}
      <Text style={s.sectionTitle}>Job Statistics</Text>
      <View style={s.jobStatsGrid}>
        {[
          { label: 'Total Jobs',  value: jobStats.total,      color: COLORS.primary },
          { label: 'Completed',   value: jobStats.completed,  color: COLORS.success },
          { label: 'In Progress', value: jobStats.inProgress, color: COLORS.info },
          { label: 'Pending',     value: jobStats.pending,    color: COLORS.warning },
        ].map(stat => (
          <View key={stat.label} style={s.jobStatCard}>
            <Text style={[s.jobStatValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={s.jobStatLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingBottom: 100 },
  periodRow: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.md },
  periodChip: { flex: 1, paddingVertical: 8, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border },
  periodActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  periodText: { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.textSecondary },
  periodTextActive: { color: '#fff' },
  revenueCard: { backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.sm, alignItems: 'center' },
  revenueLabel: { fontSize: FONT.sizes.sm, color: 'rgba(255,255,255,0.8)', marginBottom: SPACING.xs },
  revenueValue: { fontSize: 40, fontWeight: '800', color: '#fff', marginBottom: SPACING.xs },
  revenueSub: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  revenueSubText: { fontSize: FONT.sizes.sm, color: 'rgba(255,255,255,0.9)' },
  pendingCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOW.sm },
  pendingAlert: { backgroundColor: COLORS.dangerLight, borderWidth: 1, borderColor: COLORS.danger + '40' },
  pendingLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  pendingLabel: { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.textSecondary },
  pendingLabelAlert: { color: COLORS.danger },
  pendingValue: { fontSize: FONT.sizes.lg, fontWeight: '700', color: COLORS.text },
  pendingValueAlert: { color: COLORS.danger },
  sectionTitle: { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm, marginTop: SPACING.sm },
  modeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.xs, gap: SPACING.sm, ...SHADOW.sm },
  modeIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  modeName: { fontSize: FONT.sizes.xs, fontWeight: '700', color: COLORS.text, width: 80 },
  modeBar: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  modeBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  modeAmount: { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.text, width: 70, textAlign: 'right' },
  jobStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  jobStatCard: { flex: 1, minWidth: '45%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', ...SHADOW.sm },
  jobStatValue: { fontSize: FONT.sizes.xxl, fontWeight: '800' },
  jobStatLabel: { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, marginTop: 4 },
});
