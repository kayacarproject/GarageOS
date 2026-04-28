import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { mechanicApi, HanaMechanicRecord } from '../../api/mechanicApi';
import { jobcardApi, HanaJobCard } from '../../api/jobcardApi';
import { showToast } from '../../utils/toast';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

// ─── Screen ───────────────────────────────────────────────────────────────────

export const HanaAssignMechanicScreen: React.FC<{ route: any; navigation: any }> = ({
  route, navigation,
}) => {
  const { jobCardId } = route.params;
  const { user } = useAuthStore();

  const [jobCard,     setJobCard]    = useState<HanaJobCard | null>(null);
  const [mechanics,   setMechanics]  = useState<HanaMechanicRecord[]>([]);
  const [allJobCards, setAllJobCards] = useState<HanaJobCard[]>([]);
  const [loading,     setLoading]    = useState(false);
  const [assigning,   setAssigning]  = useState(false);
  const [selectedId,  setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [card, mechs, jobs] = await Promise.all([
        jobcardApi.getById(jobCardId),
        mechanicApi.getAll(),           // only active mechanics
        jobcardApi.getAll(),
      ]);
      setJobCard(card);
      setMechanics(mechs);
      setAllJobCards(jobs);
      if (card?.assignedMechanicId) {
        setSelectedId(card.assignedMechanicId); // stored as mech.id
      }
    } catch (e: any) {
      showToast(e.message ?? 'Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  }, [jobCardId]);

  // useFocusEffect so list re-fetches after returning from HanaAddMechanic
  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Active jobs per mechanic for workload display
  const workloadMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const j of allJobCards) {
      const mid = j.assignedMechanicId;
      if (mid && !['completed', 'cancelled'].includes(j.status)) {
        map[mid] = (map[mid] ?? 0) + 1;
      }
    }
    return map;
  }, [allJobCards]);

  const handleConfirm = () => {
    if (!selectedId || !jobCard) return;

    const mech     = mechanics.find(m => (m.id || m._id) === selectedId);
    if (!mech) return;

    const mechName   = mech.legalname ?? mech.name ?? 'Mechanic';
    const isSame     = selectedId === jobCard.assignedMechanicId;
    const isReassign = !!jobCard.assignedMechanicId;

    if (isSame) {
      showToast(`${mechName} is already assigned`, 'error');
      return;
    }

    Alert.alert(
      isReassign ? 'Reassign Mechanic' : 'Assign Mechanic',
      `${isReassign ? 'Reassign to' : 'Assign'} ${mechName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setAssigning(true);
            try {
              await jobcardApi.assignMechanic(jobCardId, {
                assignedMechanicId:   selectedId,
                assignedMechanicName: mechName,
                assignedAt:           new Date().toISOString(),
                assignedBy:           (user as any)?._id ?? user?.id ?? '',
              });
              showToast(`Assigned to ${mechName}`, 'success');
              navigation.goBack();
            } catch (e: any) {
              showToast(e.message ?? 'Assignment failed', 'error');
            } finally {
              setAssigning(false);
            }
          },
        },
      ],
    );
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const isReassign = !!jobCard?.assignedMechanicId;

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content}>

        {/* ── Job summary ── */}
        {jobCard && (
          <View style={s.jobCard}>
            <View style={s.jobHeader}>
              <View style={s.jobIcon}>
                <Ionicons name="car" size={22} color={COLORS.primary} />
              </View>
              <View style={s.jobInfo}>
                <Text style={s.jobPlate}>{jobCard.registrationNumber ?? '—'}</Text>
                <Text style={s.jobVehicle}>
                  {[jobCard.brand, jobCard.model].filter(Boolean).join(' ') || '—'}
                  {jobCard.workType ? `  ·  ${jobCard.workType}` : ''}
                </Text>
              </View>
            </View>
            {jobCard.description ? (
              <Text style={s.jobDesc} numberOfLines={2}>{jobCard.description}</Text>
            ) : null}
          </View>
        )}

        {/* ── Reassign info ── */}
        {isReassign && (
          <View style={s.reassignBanner}>
            <Ionicons name="information-circle-outline" size={18} color={COLORS.warning} />
            <Text style={s.reassignText}>
              Currently assigned to{' '}
              <Text style={s.reassignName}>{jobCard?.assignedMechanicName}</Text>.
              {' '}Select a different mechanic to reassign.
            </Text>
          </View>
        )}

        {/* ── Section header ── */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>
            {isReassign ? 'Reassign To' : 'Select Mechanic'}
          </Text>
          <TouchableOpacity
            style={s.addBtn}
            onPress={() => navigation.navigate('HanaAddMechanic')}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add-outline" size={14} color={COLORS.primary} />
            <Text style={s.addBtnText}>Add New</Text>
          </TouchableOpacity>
        </View>

        {/* ── Mechanic list or empty state ── */}
        {mechanics.length === 0 ? (
          <View style={s.emptyBox}>
            <Ionicons name="construct-outline" size={48} color={COLORS.textMuted} />
            <Text style={s.emptyTitle}>No mechanics found</Text>
            <Text style={s.emptySub}>
              Add your first mechanic to start assigning jobs
            </Text>
            <TouchableOpacity
              style={s.emptyAddBtn}
              onPress={() => navigation.navigate('HanaAddMechanic')}
              activeOpacity={0.85}
            >
              <Ionicons name="person-add-outline" size={18} color="#fff" />
              <Text style={s.emptyAddBtnText}>+ Add Mechanic</Text>
            </TouchableOpacity>
          </View>
        ) : (
          mechanics.map(mech => {
            const mechId   = mech.id || mech._id || '';
            const mechName = mech.legalname ?? mech.name ?? '—';
            const isSelected = selectedId === mechId;
            const isCurrent  = mechId === jobCard?.assignedMechanicId;
            const workload   = workloadMap[mechId] ?? 0;
            const busy       = workload > 2;
            const wColor = workload === 0
              ? COLORS.success
              : busy ? COLORS.danger : COLORS.warning;

            return (
              <TouchableOpacity
                key={mechId}
                style={[s.mechCard, isSelected && s.mechCardSelected]}
                onPress={() => setSelectedId(mechId)}
                activeOpacity={0.8}
              >
                <Avatar name={mechName} size={44} />

                <View style={s.mechInfo}>
                  <View style={s.mechNameRow}>
                    <Text style={s.mechName}>{mechName}</Text>
                    {isCurrent && (
                      <View style={s.currentBadge}>
                        <Text style={s.currentBadgeText}>Current</Text>
                      </View>
                    )}
                  </View>
                  {mech.mobile ? <Text style={s.mechPhone}>{mech.mobile}</Text> : null}
                  {mech.specialization ? (
                    <Text style={s.mechSpec}>{mech.specialization}</Text>
                  ) : null}
                  <View style={s.workloadRow}>
                    <Ionicons name="construct-outline" size={12} color={wColor} />
                    <Text style={[s.workloadText, { color: wColor }]}>
                      {workload === 0
                        ? 'Available'
                        : `${workload} active job${workload !== 1 ? 's' : ''}`}
                    </Text>
                  </View>
                </View>

                <View style={[s.radioOuter, isSelected && s.radioOuterSelected]}>
                  {isSelected && <View style={s.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* ── Footer ── */}
      {mechanics.length > 0 && (
        <View style={s.footer}>
          <Button
            title={assigning
              ? 'Saving…'
              : isReassign ? 'Confirm Reassignment' : 'Confirm Assignment'}
            onPress={handleConfirm}
            loading={assigning}
            disabled={!selectedId || assigning}
            fullWidth
            size="lg"
          />
        </View>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content:   { padding: SPACING.md, paddingBottom: 100 },

  jobCard:   { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOW.sm },
  jobHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  jobIcon:   { width: 44, height: 44, borderRadius: 10, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  jobInfo:   { flex: 1 },
  jobPlate:  { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  jobVehicle:{ fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  jobDesc:   { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginTop: SPACING.sm },

  reassignBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, backgroundColor: COLORS.warningLight, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.warning },
  reassignText:   { flex: 1, fontSize: FONT.sizes.sm, color: COLORS.text, lineHeight: 20 },
  reassignName:   { fontWeight: '700', color: COLORS.text },

  sectionRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  sectionTitle:{ fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  addBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primaryLight, paddingHorizontal: SPACING.sm, paddingVertical: 5, borderRadius: RADIUS.full },
  addBtnText:  { fontSize: FONT.sizes.xs, fontWeight: '700', color: COLORS.primary },

  emptyBox:      { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.sm },
  emptyTitle:    { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  emptySub:      { fontSize: FONT.sizes.sm, color: COLORS.textMuted, textAlign: 'center', paddingHorizontal: SPACING.md },
  emptyAddBtn:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, marginTop: SPACING.sm },
  emptyAddBtnText:{ fontSize: FONT.sizes.md, fontWeight: '700', color: '#fff' },

  mechCard:         { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm, borderWidth: 2, borderColor: 'transparent', gap: SPACING.sm },
  mechCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  mechInfo:         { flex: 1, gap: 2 },
  mechNameRow:      { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  mechName:         { fontSize: FONT.sizes.md, fontWeight: '600', color: COLORS.text },
  currentBadge:     { backgroundColor: COLORS.warningLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.full },
  currentBadgeText: { fontSize: 9, fontWeight: '700', color: COLORS.warning },
  mechPhone:        { fontSize: FONT.sizes.xs, color: COLORS.textMuted },
  mechSpec:         { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, fontStyle: 'italic' },
  workloadRow:      { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  workloadText:     { fontSize: FONT.sizes.xs, fontWeight: '600' },

  radioOuter:         { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  radioOuterSelected: { borderColor: COLORS.primary },
  radioInner:         { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },

  footer: { padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
});
