import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import { useJobCardStore } from '../../stores/jobCardStore';
import { useDrawer } from '../../components/CustomDrawer';
import { StatCard } from '../../components/common/StatCard';
import { JobCardListItem } from '../../components/job/JobCardListItem';
import { EmptyState } from '../../components/common/EmptyState';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

const SectionHeader: React.FC<{ title: string; count?: number; onSeeAll?: () => void }> = ({ title, count, onSeeAll }) => (
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

export const ManagerDashboard: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { jobCards, fetchAll, isLoading } = useJobCardStore();
  const { toggleDrawer } = useDrawer();

  useEffect(() => { fetchAll(); }, []);

  // Re-fetch when returning from AssignMechanicScreen so the unassigned list updates
  useFocusEffect(
    React.useCallback(() => { fetchAll(); }, []),
  );

  const active = jobCards.filter(j => j.status === 'in_progress');
  const unassigned = jobCards.filter(j => !j.mechanic_id && !j.mechanicId && j.status !== 'delivered' && j.status !== 'cancelled');
  const waiting = jobCards.filter(j => j.status === 'waiting_parts');
  const completed = jobCards.filter(j => j.status === 'delivered');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} >

      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => fetchAll()} />}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={[s.addBtn, { backgroundColor: COLORS.surface }]} onPress={toggleDrawer}>
            <Ionicons name="menu-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginStart: 20 }}>
            <Text style={s.greeting}>Manager View</Text>
            <Text style={s.name}>{user?.name}</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('NewService')}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <StatCard label="Active" value={String(active.length)} icon="construct-outline" iconColor={COLORS.info} iconBg={COLORS.infoLight} style={s.stat} />
          <StatCard label="Unassigned" value={String(unassigned.length)} icon="person-remove-outline" iconColor={COLORS.danger} iconBg={COLORS.dangerLight} style={s.stat} />
        </View>
        <View style={s.statsRow}>
          <StatCard label="Waiting Parts" value={String(waiting.length)} icon="cube-outline" iconColor={COLORS.warning} iconBg={COLORS.warningLight} style={s.stat} />
          <StatCard label="Completed" value={String(completed.length)} icon="checkmark-circle-outline" iconColor={COLORS.success} iconBg={COLORS.successLight} style={s.stat} />
        </View>

        {/* Unassigned — highlighted */}
        {unassigned.length > 0 && (
          <>
            <SectionHeader title="Needs Assignment" count={unassigned.length} onSeeAll={() => navigation.navigate('Jobs')} />
            {unassigned.slice(0, 3).map(job => (
              <TouchableOpacity
                key={job.id}
                style={s.unassignedCard}
                onPress={() => navigation.navigate('AssignMechanic', { jobCardId: job.id })}
                activeOpacity={0.8}
              >
                <View style={s.unassignedLeft}>
                  <Text style={s.unassignedJob}>{job.job_number ?? job.id}</Text>
                  <Text style={s.unassignedVehicle}>{(job.vehicle as any)?.brand ?? ''} {job.vehicle?.model}</Text>
                </View>
                <View style={s.assignCta}>
                  <Ionicons name="person-add-outline" size={14} color={COLORS.primary} />
                  <Text style={s.assignCtaText}>Assign</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Active Jobs */}
        <SectionHeader title="Active Jobs" count={active.length} onSeeAll={() => navigation.navigate('Jobs')} />
        {active.slice(0, 4).map(job => (
          <JobCardListItem key={job.id} jobCard={job} onPress={() => navigation.navigate('JobCardDetail', { id: job.id })} />
        ))}
        {active.length === 0 && <EmptyState title="No active jobs" message="All jobs are up to date" icon="checkmark-circle-outline" />}
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  greeting: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary },
  name: { fontSize: FONT.sizes.xl, fontWeight: '700', color: COLORS.text },
  addBtn: { width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  stat: { flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.md, marginBottom: SPACING.sm },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  sectionTitle: { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  countBadge: { backgroundColor: COLORS.dangerLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.full },
  countText: { fontSize: FONT.sizes.xs, color: COLORS.danger, fontWeight: '700' },
  seeAll: { fontSize: FONT.sizes.sm, color: COLORS.primary, fontWeight: '600' },
  unassignedCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm, borderLeftWidth: 3, borderLeftColor: COLORS.danger },
  unassignedLeft: { flex: 1 },
  unassignedJob: { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.text },
  unassignedVehicle: { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  assignCta: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primaryLight, paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: RADIUS.full },
  assignCtaText: { fontSize: FONT.sizes.xs, color: COLORS.primary, fontWeight: '700' },
});
