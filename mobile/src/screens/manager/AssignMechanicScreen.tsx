import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useJobCardStore } from '../../stores/jobCardStore';
import { useMechanicStore } from '../../stores/mechanicStore';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { JobStatusBadge } from '../../components/job/JobStatusBadge';
import { TrialChecklistTable } from '../../components/job/TrialChecklistTable';
import type { CreateInspectionPayload } from '../../types';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

type ScreenView = 'mechanic' | 'pretrial';

export const AssignMechanicScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { jobCardId } = route.params;

  const { selected, fetchById, assignMechanic, isLoading: jobLoading } = useJobCardStore();
  const { mechanics, isLoading: mechLoading, fetch: fetchMechanics } = useMechanicStore();
  const jobCards = useJobCardStore(s => s.jobCards);

  const [selectedMechanic, setSelectedMechanic] = useState<string | null>(null);
  const [assigning, setAssigning]               = useState(false);
  const [screenView, setScreenView]             = useState<ScreenView>('mechanic');

  // Derive pre-trial state from saved inspections so it survives screen re-mounts
  const savedPreTrial = selected?.inspections?.find(i => i.type === 'pre');
  const [preTrialDone, setPreTrialDone] = useState(!!savedPreTrial);

  useEffect(() => {
    fetchById(jobCardId);
    fetchMechanics();
  }, [jobCardId]);

  // Pre-select currently assigned mechanic and sync pre-trial state from saved inspections
  useEffect(() => {
    if (selected?.id === jobCardId) {
      const current = selected?.mechanic_id ?? selected?.mechanicId ?? null;
      setSelectedMechanic(current);
      // Keep preTrialDone in sync with what's actually saved — don't rely only on local state
      if (selected?.inspections?.find(i => i.type === 'pre')) {
        setPreTrialDone(true);
      }
    }
  }, [selected, jobCardId]);

  // Live workload map
  const workloadMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const job of jobCards) {
      const mid = job.mechanic_id ?? job.mechanicId;
      if (mid && !['delivered', 'cancelled', 'paid'].includes(job.status)) {
        map[mid] = (map[mid] ?? 0) + 1;
      }
    }
    return map;
  }, [jobCards]);

  const isReassign = !!(selected?.mechanic_id ?? selected?.mechanicId);

  const handlePreTrialSubmit = async (_payload: CreateInspectionPayload) => {
    // Replace with: await inspectionService.create(_payload)
    await new Promise(r => setTimeout(r, 400));
    setPreTrialDone(true);
    setScreenView('mechanic');
  };

  const handleConfirm = async () => {
    if (!selectedMechanic) {
      Alert.alert('No Mechanic Selected', 'Please select a mechanic before confirming.');
      return;
    }

    // Pre-trial required only for first-time assignment, not reassignment
    if (!isReassign && !preTrialDone) {
      Alert.alert(
        'Pre-Trial Required',
        'Complete the pre-trial checklist before assigning a mechanic.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Do Pre-Trial', onPress: () => setScreenView('pretrial') },
        ],
      );
      return;
    }

    const mech = mechanics.find(m => m.id === selectedMechanic);
    const currentMechId = selected?.mechanic_id ?? selected?.mechanicId;
    const isSameMechanic = selectedMechanic === currentMechId;

    if (isSameMechanic) {
      Alert.alert(
        'Already Assigned',
        `${mech?.name ?? 'This mechanic'} is already assigned to this job. Select a different mechanic to reassign.`,
      );
      return;
    }

    Alert.alert(
      isReassign ? 'Reassign Mechanic' : 'Assign Mechanic',
      `${isReassign ? 'Reassign to' : 'Assign'} ${mech?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isReassign ? 'Reassign' : 'Assign',
          onPress: async () => {
            setAssigning(true);
            try {
              await assignMechanic(jobCardId, selectedMechanic);
              Alert.alert(
                isReassign ? 'Mechanic Reassigned' : 'Mechanic Assigned',
                `${mech?.name} has been ${isReassign ? 'reassigned' : 'assigned'} successfully.`,
                [{ text: 'OK', onPress: () => navigation.goBack() }],
              );
            } catch (e: any) {
              Alert.alert('Assignment Failed', e.message ?? 'Could not assign mechanic. Please try again.');
            } finally {
              setAssigning(false);
            }
          },
        },
      ],
    );
  };

  if (jobLoading || !selected) return <LoadingSpinner fullScreen />;

  const vehicleName = `${(selected.vehicle as any)?.brand ?? ''} ${selected.vehicle?.model ?? ''}`.trim();
  const plate       = (selected.vehicle as any)?.registration_number ?? '';

  // ── Pre-trial screen ──────────────────────────────────────────────────────
  if (screenView === 'pretrial') {
    return (
      <View style={s.container}>
        <View style={s.subHeader}>
          <TouchableOpacity onPress={() => setScreenView('mechanic')} style={s.backBtn}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
            <Text style={s.backBtnText}>Back</Text>
          </TouchableOpacity>
          <Text style={s.subHeaderTitle}>Pre-Trial Checklist</Text>
          <View style={{ width: 60 }} />
        </View>
        <TrialChecklistTable
          jobCardId={jobCardId}
          mode="pre-view"
          preInspection={null}
          onSubmit={handlePreTrialSubmit}
        />
      </View>
    );
  }

  // ── Main assign screen ────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content}>

        {/* Job summary */}
        <View style={s.jobCard}>
          <View style={s.jobHeader}>
            <View style={s.jobIcon}>
              <Ionicons name="car" size={22} color={COLORS.primary} />
            </View>
            <View style={s.jobInfo}>
              <Text style={s.jobNum}>{selected.job_number ?? selected.id}</Text>
              <Text style={s.jobVehicle}>{vehicleName} · {plate}</Text>
            </View>
            <JobStatusBadge status={selected.status} />
          </View>
          {selected.description && (
            <Text style={s.jobDesc} numberOfLines={2}>{selected.description}</Text>
          )}
        </View>

        {/* Pre-trial banner — only for first assignment */}
        {!isReassign && (
          <TouchableOpacity
            style={[s.preTrialBanner, preTrialDone && s.preTrialBannerDone]}
            onPress={() => setScreenView('pretrial')}
            activeOpacity={0.8}
          >
            <View style={s.preTrialLeft}>
              <Ionicons
                name={preTrialDone ? 'checkmark-circle' : 'clipboard-outline'}
                size={22}
                color={preTrialDone ? COLORS.success : COLORS.primary}
              />
              <View>
                <Text style={[s.preTrialTitle, preTrialDone && { color: COLORS.success }]}>
                  {preTrialDone ? 'Pre-Trial Complete ✓' : 'Pre-Trial Checklist'}
                </Text>
                <Text style={s.preTrialSub}>
                  {preTrialDone ? 'Tap to review' : 'Required before first assignment'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={preTrialDone ? COLORS.success : COLORS.primary} />
          </TouchableOpacity>
        )}

        {/* Reassign info banner */}
        {isReassign && (
          <View style={s.reassignBanner}>
            <Ionicons name="information-circle-outline" size={18} color={COLORS.warning} />
            <Text style={s.reassignText}>
              Currently assigned to <Text style={s.reassignName}>{selected.mechanic?.name}</Text>. Select a different mechanic to reassign.
            </Text>
          </View>
        )}

        {/* Section header */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>
            {isReassign ? 'Reassign To' : 'Select Mechanic'}
          </Text>
          <TouchableOpacity
            style={s.addBtn}
            onPress={() => navigation.navigate('AddMechanic')}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add-outline" size={14} color={COLORS.primary} />
            <Text style={s.addBtnText}>Add New</Text>
          </TouchableOpacity>
        </View>

        {/* Mechanic list */}
        {mechLoading ? (
          <LoadingSpinner />
        ) : mechanics.length === 0 ? (
          <EmptyState
            title="No mechanics available"
            message="Add a mechanic first before assigning jobs"
            icon="construct-outline"
          />
        ) : (
          mechanics.map(mech => {
            const isSelected  = selectedMechanic === mech.id;
            const isCurrent   = mech.id === (selected?.mechanic_id ?? selected?.mechanicId);
            const workload    = workloadMap[mech.id] ?? 0;
            const busy        = workload > 2;

            return (
              <TouchableOpacity
                key={mech.id}
                style={[s.mechCard, isSelected && s.mechCardSelected]}
                onPress={() => setSelectedMechanic(mech.id)}
                activeOpacity={0.8}
              >
                <Avatar name={mech.name} size={44} />
                <View style={s.mechInfo}>
                  <View style={s.mechNameRow}>
                    <Text style={s.mechName}>{mech.name}</Text>
                    {isCurrent && (
                      <View style={s.currentBadge}>
                        <Text style={s.currentBadgeText}>Current</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.mechPhone}>{mech.mobile}</Text>
                  <View style={s.workloadRow}>
                    <Ionicons
                      name="construct-outline"
                      size={12}
                      color={workload === 0 ? COLORS.success : busy ? COLORS.danger : COLORS.warning}
                    />
                    <Text style={[
                      s.workloadText,
                      { color: workload === 0 ? COLORS.success : busy ? COLORS.danger : COLORS.warning },
                    ]}>
                      {workload === 0 ? 'Available' : `${workload} active job${workload !== 1 ? 's' : ''}`}
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

      {/* Footer */}
      <View style={s.footer}>
        <Button
          title={assigning ? 'Saving...' : isReassign ? 'Confirm Reassignment' : 'Confirm Assignment'}
          onPress={handleConfirm}
          loading={assigning}
          disabled={!selectedMechanic || assigning}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container:          { flex: 1, backgroundColor: COLORS.background },
  content:            { padding: SPACING.md, paddingBottom: 100 },

  subHeader:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn:            { flexDirection: 'row', alignItems: 'center', gap: 4, width: 60 },
  backBtnText:        { fontSize: FONT.sizes.sm, color: COLORS.text, fontWeight: '600' },
  subHeaderTitle:     { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },

  jobCard:            { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOW.sm },
  jobHeader:          { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  jobIcon:            { width: 44, height: 44, borderRadius: 10, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  jobInfo:            { flex: 1 },
  jobNum:             { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  jobVehicle:         { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  jobDesc:            { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginTop: SPACING.sm },

  preTrialBanner:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1.5, borderColor: COLORS.primary },
  preTrialBannerDone: { backgroundColor: COLORS.successLight, borderColor: COLORS.success },
  preTrialLeft:       { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  preTrialTitle:      { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.primary },
  preTrialSub:        { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },

  reassignBanner:     { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, backgroundColor: COLORS.warningLight, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.warning },
  reassignText:       { flex: 1, fontSize: FONT.sizes.sm, color: COLORS.text, lineHeight: 20 },
  reassignName:       { fontWeight: '700', color: COLORS.text },

  sectionRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  sectionTitle:       { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  addBtn:             { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primaryLight, paddingHorizontal: SPACING.sm, paddingVertical: 5, borderRadius: RADIUS.full },
  addBtnText:         { fontSize: FONT.sizes.xs, fontWeight: '700', color: COLORS.primary },

  mechCard:           { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm, borderWidth: 2, borderColor: 'transparent', gap: SPACING.sm },
  mechCardSelected:   { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  mechInfo:           { flex: 1, gap: 2 },
  mechNameRow:        { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  mechName:           { fontSize: FONT.sizes.md, fontWeight: '600', color: COLORS.text },
  currentBadge:       { backgroundColor: COLORS.warningLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.full },
  currentBadgeText:   { fontSize: 9, fontWeight: '700', color: COLORS.warning },
  mechPhone:          { fontSize: FONT.sizes.xs, color: COLORS.textMuted },
  workloadRow:        { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  workloadText:       { fontSize: FONT.sizes.xs, fontWeight: '600' },

  radioOuter:         { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  radioOuterSelected: { borderColor: COLORS.primary },
  radioInner:         { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },

  footer:             { padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
});
