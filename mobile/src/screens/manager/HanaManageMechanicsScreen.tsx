import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { mechanicApi, HanaMechanicRecord } from '../../api/mechanicApi';
import { jobcardApi } from '../../api/jobcardApi';
import { showToast } from '../../utils/toast';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const isActive = status !== 'inactive' && status !== 'deleted';
  return (
    <View style={[badge.wrap, isActive ? badge.active : badge.inactive]}>
      <View style={[badge.dot, isActive ? badge.dotActive : badge.dotInactive]} />
      <Text style={[badge.text, isActive ? badge.textActive : badge.textInactive]}>
        {isActive ? 'Active' : 'Inactive'}
      </Text>
    </View>
  );
};

const badge = StyleSheet.create({
  wrap:         { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  active:       { backgroundColor: COLORS.successLight },
  inactive:     { backgroundColor: '#F3F4F6' },
  dot:          { width: 6, height: 6, borderRadius: 3 },
  dotActive:    { backgroundColor: COLORS.success },
  dotInactive:  { backgroundColor: COLORS.textMuted },
  text:         { fontSize: 11, fontWeight: '700' },
  textActive:   { color: COLORS.success },
  textInactive: { color: COLORS.textMuted },
});

// ─── Workload badge ───────────────────────────────────────────────────────────

const WorkloadBadge: React.FC<{ count: number }> = ({ count }) => {
  const color   = count === 0 ? COLORS.success : count <= 2 ? COLORS.warning : COLORS.danger;
  const bg      = count === 0 ? COLORS.successLight : count <= 2 ? COLORS.warningLight : COLORS.dangerLight;
  const label   = count === 0 ? 'Available' : `${count} active job${count !== 1 ? 's' : ''}`;
  return (
    <View style={[wl.wrap, { backgroundColor: bg }]}>
      <Ionicons name="construct-outline" size={11} color={color} />
      <Text style={[wl.text, { color }]}>{label}</Text>
    </View>
  );
};

const wl = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  text: { fontSize: 11, fontWeight: '700' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export const HanaManageMechanicsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { canManageUsers } = useAuthStore();

  const [mechanics,  setMechanics]  = useState<HanaMechanicRecord[]>([]);
  const [jobCards,   setJobCards]   = useState<any[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [actionId,   setActionId]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mechs, jobs] = await Promise.all([
        mechanicApi.getAll({ includeInactive: true }),
        jobcardApi.getAll(),
      ]);
      setMechanics(mechs);
      setJobCards(jobs);
    } catch (e: any) {
      showToast(e.message ?? 'Failed to load mechanics', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Active jobs per mechanic
  const workloadMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const j of jobCards) {
      const mid = j.assignedMechanicId;
      if (mid && !['completed', 'cancelled'].includes(j.status)) {
        map[mid] = (map[mid] ?? 0) + 1;
      }
    }
    return map;
  }, [jobCards]);

  // ── Action handlers ──────────────────────────────────────────────────────────

  const handleToggleStatus = (m: HanaMechanicRecord) => {
    const mechId   = m._id || m.id || '';
    const mechName = m.legalname ?? m.name ?? 'Mechanic';
    const isActive = m.status !== 'inactive' && m.status !== 'deleted';

    Alert.alert(
      isActive ? 'Deactivate Mechanic' : 'Activate Mechanic',
      isActive
        ? `Deactivate ${mechName}? They won't appear in assignment lists.`
        : `Activate ${mechName}? They will be available for job assignments.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isActive ? 'Deactivate' : 'Activate',
          style: isActive ? 'destructive' : 'default',
          onPress: async () => {
            setActionId(mechId);
            try {
              if (isActive) await mechanicApi.deactivate(mechId);
              else           await mechanicApi.activate(mechId);
              showToast(
                `${mechName} ${isActive ? 'deactivated' : 'activated'}`,
                'success',
              );
              setMechanics(prev =>
                prev.map(x =>
                  (x._id || x.id) === mechId
                    ? { ...x, status: isActive ? 'inactive' : 'active' }
                    : x,
                ),
              );
            } catch (e: any) {
              showToast(e.message ?? 'Action failed', 'error');
            } finally {
              setActionId(null);
            }
          },
        },
      ],
    );
  };

  const handleDelete = (m: HanaMechanicRecord) => {
    const mechId   = m._id || m.id || '';
    const mechName = m.legalname ?? m.name ?? 'Mechanic';
    const workload = workloadMap[mechId] ?? 0;

    if (workload > 0) {
      Alert.alert(
        'Cannot Delete',
        `${mechName} has ${workload} active job${workload !== 1 ? 's' : ''}. Reassign or complete those jobs first.`,
      );
      return;
    }

    Alert.alert(
      'Delete Mechanic',
      `Permanently delete ${mechName}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActionId(mechId);
            try {
              await mechanicApi.delete(mechId);
              showToast(`${mechName} removed`, 'success');
              setMechanics(prev => prev.filter(x => (x._id || x.id) !== mechId));
            } catch (e: any) {
              showToast(e.message ?? 'Delete failed', 'error');
            } finally {
              setActionId(null);
            }
          },
        },
      ],
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <View style={s.container}>
      <FlatList
        data={mechanics}
        keyExtractor={m => m._id || m.id || Math.random().toString()}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              title="No mechanics yet"
              message="Tap + to add your first mechanic"
              icon="construct-outline"
            />
          ) : null
        }
        renderItem={({ item: m }) => {
          const mechId   = m._id || m.id || '';
          const mechName = m.legalname ?? m.name ?? '—';
          const isActive = m.status !== 'inactive' && m.status !== 'deleted';
          const workload = workloadMap[mechId] ?? 0;
          const busy     = actionId === mechId;

          return (
            <View style={s.card}>
              {/* Top row */}
              <View style={s.cardTop}>
                <Avatar name={mechName} size={46} />
                <View style={s.info}>
                  <Text style={s.name}>{mechName}</Text>
                  {m.mobile ? <Text style={s.mobile}>{m.mobile}</Text> : null}
                  {m.specialization ? (
                    <Text style={s.spec}>{m.specialization}</Text>
                  ) : null}
                  <View style={s.badgeRow}>
                    <StatusBadge status={m.status} />
                    <WorkloadBadge count={workload} />
                  </View>
                </View>
              </View>

              {/* Action row */}
              <View style={s.actions}>
                {/* Activate / Deactivate */}
                <TouchableOpacity
                  style={[s.actionBtn, isActive ? s.deactivateBtn : s.activateBtn]}
                  onPress={() => handleToggleStatus(m)}
                  disabled={busy}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={isActive ? 'pause-circle-outline' : 'play-circle-outline'}
                    size={15}
                    color={isActive ? COLORS.warning : COLORS.success}
                  />
                  <Text style={[s.actionBtnText, { color: isActive ? COLORS.warning : COLORS.success }]}>
                    {isActive ? 'Deactivate' : 'Activate'}
                  </Text>
                </TouchableOpacity>

                {/* Delete — only owner / super admin */}
                {canManageUsers() && (
                  <TouchableOpacity
                    style={[s.actionBtn, s.deleteBtn]}
                    onPress={() => handleDelete(m)}
                    disabled={busy}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="trash-outline" size={15} color={COLORS.danger} />
                    <Text style={[s.actionBtnText, { color: COLORS.danger }]}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Experience / address details */}
              {(m.experience || m.address) ? (
                <View style={s.metaRow}>
                  {m.experience ? (
                    <View style={s.metaItem}>
                      <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
                      <Text style={s.metaText}>{m.experience} exp.</Text>
                    </View>
                  ) : null}
                  {m.address ? (
                    <View style={s.metaItem}>
                      <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
                      <Text style={s.metaText} numberOfLines={1}>{m.address}</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>
          );
        }}
      />

      {/* FAB */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('HanaAddMechanic')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list:      { padding: SPACING.md, paddingBottom: 100, gap: SPACING.sm },

  card:       { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOW.sm, gap: SPACING.sm },
  cardTop:    { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  info:       { flex: 1, gap: 3 },
  name:       { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  mobile:     { fontSize: FONT.sizes.sm, color: COLORS.textSecondary },
  spec:       { fontSize: FONT.sizes.xs, color: COLORS.textMuted, fontStyle: 'italic' },
  badgeRow:   { flexDirection: 'row', gap: SPACING.xs, flexWrap: 'wrap', marginTop: 2 },

  actions:       { flexDirection: 'row', gap: SPACING.sm },
  actionBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, borderRadius: RADIUS.md, borderWidth: 1.5 },
  activateBtn:   { borderColor: COLORS.success, backgroundColor: COLORS.successLight },
  deactivateBtn: { borderColor: COLORS.warning, backgroundColor: COLORS.warningLight },
  deleteBtn:     { borderColor: COLORS.danger, backgroundColor: COLORS.dangerLight },
  actionBtnText: { fontSize: FONT.sizes.xs, fontWeight: '700' },

  metaRow:  { flexDirection: 'row', gap: SPACING.md, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FONT.sizes.xs, color: COLORS.textMuted, flex: 1 },

  fab: { position: 'absolute', bottom: SPACING.xl, right: SPACING.lg, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOW.lg },
});
