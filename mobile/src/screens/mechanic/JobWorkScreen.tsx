import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useJobCardStore } from '../../stores/jobCardStore';
import { JobStatusBadge } from '../../components/job/JobStatusBadge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PhoneMasked } from '../../components/common/PhoneMasked';
import { canTransition } from '../../constants/jobCardLifecycle';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';
import type { JobCardStatus } from '../../types';

// ─── Status action config ─────────────────────────────────────────────────────

interface StatusAction {
  to: JobCardStatus;
  label: string;
  color: string;
  icon: string;
  requiresPostTrial?: boolean;
}

const STATUS_ACTIONS: StatusAction[] = [
  { to: 'in_progress',    label: 'Start Work',          color: COLORS.primary,  icon: 'play-circle-outline' },
  { to: 'waiting_parts',  label: 'Waiting for Parts',   color: COLORS.warning,  icon: 'time-outline' },
  { to: 'in_progress',    label: 'Resume Work',          color: COLORS.info,     icon: 'refresh-circle-outline' },
  { to: 'work_completed', label: 'Mark Work Complete',   color: COLORS.success,  icon: 'checkmark-circle-outline', requiresPostTrial: true },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const JobWorkScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { jobCardId } = route.params;
  const { selected, fetchById, updateStatus, update, isLoading } = useJobCardStore();
  const [notes, setNotes]       = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchById(jobCardId); }, [jobCardId]);

  // Re-fetch on focus so returning from post-trial reflects new status
  useFocusEffect(
    useCallback(() => { fetchById(jobCardId); }, [jobCardId]),
  );

  useEffect(() => {
    if (selected?.id === jobCardId && selected?.notes) {
      setNotes(selected.notes);
    }
  }, [selected, jobCardId]);

  if (isLoading || !selected) return <LoadingSpinner fullScreen />;

  const vehicleName    = `${(selected.vehicle as any)?.brand ?? ''} ${selected.vehicle?.model ?? ''}`.trim();
  const plate          = (selected.vehicle as any)?.registration_number ?? '';
  const customerName   = selected.vehicle?.customer?.name ?? '—';
  const customerMobile = selected.vehicle?.customer?.mobile ?? '';

  // Build available transitions from the current live status
  const availableActions = STATUS_ACTIONS.filter(a => canTransition(selected.status, a.to));

  const handleStatusChange = (action: StatusAction) => {
    if (action.requiresPostTrial && action.to === 'work_completed') {
      Alert.alert(
        'Work Complete',
        'Before marking complete, submit the Post-Trial (QC) checklist.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Do Post-Trial',
            onPress: async () => {
              setUpdating(true);
              try {
                await updateStatus(jobCardId, 'work_completed');
              } catch (e: any) {
                Alert.alert('Failed', e.message ?? 'Could not update status.');
                setUpdating(false);
                return;
              }
              setUpdating(false);
              navigation.navigate('Inspection', {
                jobCardId,
                type: 'post',
                preInspection: selected.inspections?.find(i => i.type === 'pre') ?? null,
              });
            },
          },
        ],
      );
      return;
    }

    Alert.alert('Update Status', `Change to "${action.label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          setUpdating(true);
          try {
            await updateStatus(jobCardId, action.to, notes.trim() || undefined);
          } catch (e: any) {
            Alert.alert('Failed', e.message ?? 'Could not update status.');
          } finally {
            setUpdating(false);
          }
        },
      },
    ]);
  };

  const handleSaveNotes = async () => {
    try {
      await update(jobCardId, { notes: notes.trim() });
      Alert.alert('Saved', 'Work notes updated.');
    } catch (e: any) {
      Alert.alert('Failed', e.message ?? 'Could not save notes.');
    }
  };

  const isLocked  = ['delivered', 'cancelled', 'paid'].includes(selected.status);
  const isQcStage = ['work_completed', 'qc_pending', 'qc_failed', 'qc_passed'].includes(selected.status);

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content}>

        {/* ── Job Header ── */}
        <View style={s.headerCard}>
          <View style={s.headerTop}>
            <View style={s.jobIcon}>
              <Ionicons name="construct" size={22} color={COLORS.primary} />
            </View>
            <View style={s.headerInfo}>
              <Text style={s.jobNum}>{selected.job_number ?? selected.id}</Text>
              <Text style={s.workType}>{selected.work_type?.toUpperCase() ?? 'SERVICE'}</Text>
            </View>
            <JobStatusBadge status={selected.status} large />
          </View>
        </View>

        {/* ── Delivery lock banner ── */}
        {isLocked && (
          <View style={s.lockedBanner}>
            <Ionicons name="lock-closed-outline" size={16} color={COLORS.success} />
            <Text style={s.lockedText}>
              {selected.status === 'delivered'
                ? 'Vehicle delivered. Job is locked.'
                : selected.status === 'paid'
                  ? 'Payment complete. Awaiting delivery.'
                  : 'Job cancelled.'}
            </Text>
          </View>
        )}

        {/* ── QC stage banner ── */}
        {isQcStage && !isLocked && (
          <View style={[s.qcBanner, selected.status === 'qc_failed' ? s.qcBannerFail : s.qcBannerPass]}>
            <Ionicons
              name={selected.status === 'qc_failed' ? 'warning-outline' : 'shield-checkmark-outline'}
              size={16}
              color={selected.status === 'qc_failed' ? COLORS.danger : COLORS.warning}
            />
            <Text style={[s.qcText, { color: selected.status === 'qc_failed' ? COLORS.danger : COLORS.warning }]}>
              {selected.status === 'work_completed' && 'Work complete — submit QC post-trial.'}
              {selected.status === 'qc_pending'     && 'QC in progress — post-trial being reviewed.'}
              {selected.status === 'qc_failed'      && 'QC failed — rework required. Resume work to fix issues.'}
              {selected.status === 'qc_passed'      && 'QC passed — ready for invoicing.'}
            </Text>
          </View>
        )}

        {/* ── Vehicle ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Vehicle</Text>
          <View style={s.infoRow}>
            <Ionicons name="car-outline" size={16} color={COLORS.textSecondary} />
            <Text style={s.infoText}>{vehicleName}</Text>
          </View>
          <View style={s.infoRow}>
            <Ionicons name="barcode-outline" size={16} color={COLORS.textSecondary} />
            <Text style={s.infoText}>{plate}</Text>
          </View>
          <View style={s.infoRow}>
            <Ionicons name="speedometer-outline" size={16} color={COLORS.textSecondary} />
            <Text style={s.infoText}>{selected.current_kms?.toLocaleString('en-IN') ?? '—'} km</Text>
          </View>
        </View>

        {/* ── Customer ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Customer</Text>
          <View style={s.infoRow}>
            <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
            <Text style={s.infoText}>{customerName}</Text>
          </View>
          {customerMobile ? (
            <View style={s.infoRow}>
              <Ionicons name="call-outline" size={16} color={COLORS.textSecondary} />
              <PhoneMasked phone={customerMobile} />
            </View>
          ) : null}
        </View>

        {/* ── Description ── */}
        {selected.description && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Work Description</Text>
            <Text style={s.descText}>{selected.description}</Text>
          </View>
        )}

        {/* ── Status Transitions ── */}
        {!isLocked && availableActions.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Update Status</Text>
            <View style={s.transitionRow}>
              {availableActions.map(action => (
                <TouchableOpacity
                  key={`${action.to}-${action.label}`}
                  style={[s.transitionBtn, { borderColor: action.color, opacity: updating ? 0.6 : 1 }]}
                  onPress={() => handleStatusChange(action)}
                  disabled={updating}
                  activeOpacity={0.8}
                >
                  <Ionicons name={action.icon as any} size={18} color={action.color} />
                  <Text style={[s.transitionText, { color: action.color }]}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Post-trial shortcut when work complete or qc failed ── */}
        {(selected.status === 'work_completed' || selected.status === 'qc_failed') && (
          <TouchableOpacity
            style={s.postTrialBtn}
            onPress={() => navigation.navigate('Inspection', {
              jobCardId,
              type: 'post',
              preInspection: selected.inspections?.find(i => i.type === 'pre') ?? null,
            })}
            activeOpacity={0.85}
          >
            <Ionicons name="clipboard-outline" size={20} color={COLORS.success} />
            <Text style={s.postTrialBtnText}>
              {selected.status === 'qc_failed' ? 'Re-Submit Post-Trial (QC)' : 'Submit Post-Trial (QC)'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.success} />
          </TouchableOpacity>
        )}

        {/* ── Work Notes ── */}
        {!isLocked && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Work Notes</Text>
            <TextInput
              style={s.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes about work done, parts used, observations..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Button title="Save Notes" onPress={handleSaveNotes} variant="secondary" size="sm" style={s.saveBtn} />
          </View>
        )}

        {/* ── Inspections quick-view ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Inspections</Text>
          <View style={s.inspectionRow}>
            {(['pre', 'post'] as const).map(type => {
              const done = !!selected.inspections?.find(i => i.type === type);
              return (
                <TouchableOpacity
                  key={type}
                  style={[s.inspectionChip, done && s.inspectionChipDone]}
                  onPress={() => navigation.navigate('Inspection', {
                    jobCardId,
                    type,
                    preInspection: selected.inspections?.find(i => i.type === 'pre') ?? null,
                  })}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={done ? 'checkmark-circle' : 'clipboard-outline'}
                    size={16}
                    color={done ? COLORS.success : COLORS.textSecondary}
                  />
                  <Text style={[s.inspectionChipText, done && { color: COLORS.success }]}>
                    {type === 'pre' ? 'Pre-Trial' : 'Post-Trial'} {done ? '✓' : '—'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:          { flex: 1, backgroundColor: COLORS.background },
  content:            { padding: SPACING.md, paddingBottom: 100 },

  headerCard:         { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm },
  headerTop:          { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  jobIcon:            { width: 44, height: 44, borderRadius: 10, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  headerInfo:         { flex: 1 },
  jobNum:             { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  workType:           { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 2 },

  lockedBanner:       { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.successLight, borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.success },
  lockedText:         { flex: 1, fontSize: FONT.sizes.sm, color: COLORS.success, fontWeight: '600' },

  qcBanner:           { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.sm, borderWidth: 1 },
  qcBannerFail:       { backgroundColor: COLORS.dangerLight, borderColor: COLORS.danger },
  qcBannerPass:       { backgroundColor: COLORS.warningLight, borderColor: COLORS.warning },
  qcText:             { flex: 1, fontSize: FONT.sizes.sm, fontWeight: '600' },

  section:            { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm },
  sectionTitle:       { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  infoRow:            { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 6 },
  infoText:           { fontSize: FONT.sizes.sm, color: COLORS.textSecondary },
  descText:           { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, lineHeight: 22 },

  transitionRow:      { gap: SPACING.sm },
  transitionBtn:      { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: 12, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1.5 },
  transitionText:     { fontSize: FONT.sizes.sm, fontWeight: '700', flex: 1 },

  postTrialBtn:       { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.successLight, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1.5, borderColor: COLORS.success },
  postTrialBtnText:   { flex: 1, fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.success },

  notesInput:         { backgroundColor: COLORS.background, borderRadius: RADIUS.sm, padding: SPACING.sm, fontSize: FONT.sizes.sm, color: COLORS.text, minHeight: 100, borderWidth: 1, borderColor: COLORS.border },
  saveBtn:            { marginTop: SPACING.sm, alignSelf: 'flex-end' },

  inspectionRow:      { flexDirection: 'row', gap: SPACING.sm },
  inspectionChip:     { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  inspectionChipDone: { backgroundColor: COLORS.successLight, borderColor: COLORS.success },
  inspectionChipText: { fontSize: FONT.sizes.xs, fontWeight: '600', color: COLORS.textSecondary, flex: 1 },
});
