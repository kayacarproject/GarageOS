import React, { useEffect, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useMechanicStore } from '../../stores/mechanicStore';
import { useJobCardStore } from '../../stores/jobCardStore';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';
import type { User } from '../../types';

// ─── Workload badge ───────────────────────────────────────────────────────────

const WorkloadBadge: React.FC<{ count: number }> = ({ count }) => {
  const color  = count === 0 ? COLORS.success : count <= 2 ? COLORS.warning : COLORS.danger;
  const bgColor = count === 0 ? COLORS.successLight : count <= 2 ? COLORS.warningLight : COLORS.dangerLight;
  const label  = count === 0 ? 'Available' : `${count} job${count !== 1 ? 's' : ''}`;
  return (
    <View style={[s.badge, { backgroundColor: bgColor }]}>
      <Ionicons name="construct-outline" size={11} color={color} />
      <Text style={[s.badgeText, { color }]}>{label}</Text>
    </View>
  );
};

// ─── Mechanic row ─────────────────────────────────────────────────────────────

const MechanicRow: React.FC<{
  mechanic: User;
  workload: number;
  onDeactivate: () => void;
}> = ({ mechanic, workload, onDeactivate }) => (
  <View style={s.row}>
    <Avatar name={mechanic.name} size={46} />
    <View style={s.rowInfo}>
      <Text style={s.rowName}>{mechanic.name}</Text>
      <Text style={s.rowPhone}>{mechanic.mobile}</Text>
      <WorkloadBadge count={workload} />
    </View>
    <TouchableOpacity
      style={s.deactivateBtn}
      onPress={onDeactivate}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons name="person-remove-outline" size={18} color={COLORS.danger} />
    </TouchableOpacity>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export const MechanicListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { mechanics, isLoading, fetch, deactivate } = useMechanicStore();
  const { jobCards, fetchAll } = useJobCardStore();

  useEffect(() => {
    fetch();
    fetchAll();
  }, []);

  // Re-fetch when returning from AddMechanicScreen
  useFocusEffect(
    React.useCallback(() => { fetch(); }, []),
  );

  // Live workload: count active jobs per mechanic
  const workloadMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const job of jobCards) {
      const mid = job.mechanic_id ?? job.mechanicId;
      if (mid && job.status !== 'delivered' && job.status !== 'cancelled' && job.status !== 'paid') {
        map[mid] = (map[mid] ?? 0) + 1;
      }
    }
    return map;
  }, [jobCards]);

  const handleDeactivate = (m: User) => {
    Alert.alert(
      'Remove Mechanic',
      `Remove ${m.name} from the team? They will no longer appear in assignments.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive',
          onPress: async () => {
            try { await deactivate(m.id); }
            catch (e: any) { Alert.alert('Error', e.message); }
          },
        },
      ],
    );
  };

  return (
    <View style={s.container}>
      <FlatList
        data={mechanics}
        keyExtractor={m => m.id}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetch} />}
        ItemSeparatorComponent={() => <View style={s.separator} />}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title="No mechanics yet"
              message="Add your first mechanic to start assigning jobs"
              icon="construct-outline"
            />
          ) : null
        }
        renderItem={({ item }) => (
          <MechanicRow
            mechanic={item}
            workload={workloadMap[item.id] ?? 0}
            onDeactivate={() => handleDeactivate(item)}
          />
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('AddMechanic')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.background },
  list:          { padding: SPACING.md, paddingBottom: 100 },
  separator:     { height: SPACING.sm },

  row:           { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.sm, ...SHADOW.sm },
  rowInfo:       { flex: 1, gap: 3 },
  rowName:       { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  rowPhone:      { fontSize: FONT.sizes.sm, color: COLORS.textSecondary },

  badge:         { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full, marginTop: 2 },
  badgeText:     { fontSize: FONT.sizes.xs, fontWeight: '700' },

  deactivateBtn: { padding: SPACING.xs },

  fab:           { position: 'absolute', bottom: SPACING.xl, right: SPACING.lg, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOW.lg },
});
