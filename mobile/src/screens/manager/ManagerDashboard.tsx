import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import { useHanaJobCardStore } from '../../stores/hanaJobCardStore';
import { useDrawer } from '../../components/CustomDrawer';
import { StatCard } from '../../components/common/StatCard';
import { EmptyState } from '../../components/common/EmptyState';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';
import type { HanaJobCard } from '../../api/jobcardApi';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  open:        { label: 'Open',        color: COLORS.warning, bg: COLORS.warningLight  },
  in_progress: { label: 'In Progress', color: COLORS.info,    bg: COLORS.infoLight     },
  completed:   { label: 'Completed',   color: COLORS.success, bg: COLORS.successLight  },
  cancelled:   { label: 'Cancelled',   color: COLORS.danger,  bg: COLORS.dangerLight   },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ title: string; count?: number; onSeeAll?: () => void }> = ({
  title, count, onSeeAll,
}) => (
  <View style={s.sectionHeader}>
    <View style={s.sectionLeft}>
      <Text style={s.sectionTitle}>{title}</Text>
      {count !== undefined && (
        <View style={s.countBadge}><Text style={s.countText}>{count}</Text></View>
      )}
    </View>
    {onSeeAll && <TouchableOpacity onPress={onSeeAll}><Text style={s.seeAll}>See all</Text></TouchableOpacity>}
  </View>
);

const HanaJobCardRow: React.FC<{ job: HanaJobCard; onPress: () => void }> = ({ job, onPress }) => {
  const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.open;
  return (
    <TouchableOpacity style={[s.jobCard, { borderLeftColor: cfg.color }]} onPress={onPress} activeOpacity={0.8}>
      <View style={s.jobCardLeft}>
        <Text style={s.jobCardPlate}>{job.registrationNumber ?? '—'}</Text>
        <Text style={s.jobCardSub}>
          {[job.brand, job.model].filter(Boolean).join(' ')}
          {job.workType ? `  ·  ${job.workType}` : ''}
        </Text>
        {job.description ? (
          <Text style={s.jobCardDesc} numberOfLines={1}>{job.description}</Text>
        ) : null}
      </View>
      <View style={s.jobCardRight}>
        <View style={[s.statusPill, { backgroundColor: cfg.bg }]}>
          <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        {job.currentKM ? (
          <Text style={s.jobCardKm}>{parseInt(job.currentKM).toLocaleString('en-IN')} km</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const ManagerDashboard: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { jobCards, fetchAll, isLoading } = useHanaJobCardStore();
  const { toggleDrawer } = useDrawer();

  useEffect(() => { fetchAll(); }, []);

  useFocusEffect(
    React.useCallback(() => { fetchAll(); }, []),
  );

  // ─── Derived counts ────────────────────────────────────────────────────────

  const total     = jobCards.length;
  const active    = useMemo(() => jobCards.filter(j => j.status === 'open' || j.status === 'in_progress'), [jobCards]);
  const completed = useMemo(() => jobCards.filter(j => j.status === 'completed'),  [jobCards]);
  const pending   = useMemo(() => jobCards.filter(j => j.status === 'open'),        [jobCards]);

  // Recent 4 active jobs for dashboard preview
  const recentActive = active.slice(0, 4);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchAll} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <TouchableOpacity style={[s.addBtn, { backgroundColor: COLORS.surface }]} onPress={toggleDrawer}>
            <Ionicons name="menu-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginStart: 20 }}>
            <Text style={s.greeting}>Manager View 👋</Text>
            <Text style={s.name}>Welcome, {(user?.legalname ?? user?.name)?.trim() || 'User'}</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('NewService')}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ── KPI Stats — all tappable ── */}
        <View style={s.statsRow}>
          <StatCard
            label="Total Job Cards"
            value={String(total)}
            icon="document-text-outline"
            iconColor={COLORS.primary}
            iconBg={COLORS.primaryLight}
            style={s.stat}
            onPress={() => navigation.navigate('HanaJobCards', { filter: 'all' })}
          />
          <StatCard
            label="Active Jobs"
            value={String(active.length)}
            icon="construct-outline"
            iconColor={COLORS.info}
            iconBg={COLORS.infoLight}
            style={s.stat}
            onPress={() => navigation.navigate('HanaJobCards', { filter: 'active' })}
          />
        </View>
        <View style={s.statsRow}>
          <StatCard
            label="Pending"
            value={String(pending.length)}
            icon="time-outline"
            iconColor={COLORS.warning}
            iconBg={COLORS.warningLight}
            style={s.stat}
            onPress={() => navigation.navigate('HanaJobCards', { filter: 'open' })}
          />
          <StatCard
            label="Completed"
            value={String(completed.length)}
            icon="checkmark-circle-outline"
            iconColor={COLORS.success}
            iconBg={COLORS.successLight}
            style={s.stat}
            onPress={() => navigation.navigate('HanaJobCards', { filter: 'completed' })}
          />
        </View>

        {/* ── Active Jobs list ── */}
        <SectionHeader
          title="Active Jobs"
          count={active.length}
          onSeeAll={() => navigation.navigate('HanaJobCards', { filter: 'active' })}
        />

        {recentActive.length === 0 ? (
          <EmptyState title="No active jobs" message="All jobs are up to date" icon="checkmark-circle-outline" />
        ) : (
          recentActive.map(job => (
            <HanaJobCardRow
              key={job._id}
              job={job}
              onPress={() => navigation.navigate('HanaJobCardDetail', { id: job._id })}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  content:      { padding: SPACING.md, paddingBottom: 100 },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  greeting:     { fontSize: FONT.sizes.sm, color: COLORS.textSecondary },
  name:         { fontSize: FONT.sizes.xl, fontWeight: '700', color: COLORS.text },
  addBtn:       { width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  statsRow:     { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  stat:         { flex: 1 },
  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.md, marginBottom: SPACING.sm },
  sectionLeft:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  sectionTitle: { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  countBadge:   { backgroundColor: COLORS.primaryLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.full },
  countText:    { fontSize: FONT.sizes.xs, color: COLORS.primary, fontWeight: '700' },
  seeAll:       { fontSize: FONT.sizes.sm, color: COLORS.primary, fontWeight: '600' },

  // Job card row
  jobCard:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm, borderLeftWidth: 3, borderLeftColor: COLORS.border },
  jobCardLeft:  { flex: 1, marginRight: SPACING.sm },
  jobCardPlate: { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  jobCardSub:   { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  jobCardDesc:  { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 3 },
  jobCardRight: { alignItems: 'flex-end', gap: 4 },
  jobCardKm:    { fontSize: FONT.sizes.xs, color: COLORS.textMuted },
  statusPill:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  statusText:   { fontSize: FONT.sizes.xs, fontWeight: '700' },
});
