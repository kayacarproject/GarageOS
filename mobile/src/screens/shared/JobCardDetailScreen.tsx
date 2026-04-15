import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useJobCardStore } from '../../stores/jobCardStore';
import { useAuthStore } from '../../stores/authStore';
import { invoiceService } from '../../services/invoiceService';
import { estimateService } from '../../services/estimateService';
import { canTransition } from '../../constants/jobCardLifecycle';
import { JobStatusBadge } from '../../components/job/JobStatusBadge';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PhoneMasked } from '../../components/common/PhoneMasked';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

const InfoRow: React.FC<{ icon: any; label: string; value: string }> = ({ icon, label, value }) => (
  <View style={s.infoRow}>
    <Ionicons name={icon} size={15} color={COLORS.textSecondary} />
    <Text style={s.infoLabel}>{label}</Text>
    <Text style={s.infoValue}>{value}</Text>
  </View>
);

export const JobCardDetailScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { id } = route.params;
  const { selected, fetchById, update, updateStatus, isLoading } = useJobCardStore();
  const { canApproveEstimate, canAssignMechanic, canViewFinancials, user } = useAuthStore();

  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [deliveringVehicle, setDeliveringVehicle]  = useState(false);

  useEffect(() => { fetchById(id); }, [id]);

  // Re-fetch whenever screen comes back into focus (after AssignMechanic, Inspection, etc.)
  useFocusEffect(
    useCallback(() => { fetchById(id); }, [id]),
  );

  if (isLoading || !selected) return <LoadingSpinner fullScreen />;

  const vehicleName    = `${(selected.vehicle as any)?.brand ?? (selected.vehicle as any)?.make ?? ''} ${selected.vehicle?.model ?? ''}`.trim();
  const plate          = (selected.vehicle as any)?.registration_number ?? (selected.vehicle as any)?.licensePlate ?? '';
  const customerName   = selected.vehicle?.customer?.name ?? '—';
  const customerMobile = selected.vehicle?.customer?.mobile ?? '';
  const dateStr        = selected.created_at ?? selected.inDate ?? '';

  const isMechanic    = user?.role === 'MECHANIC';
  const isDelivered   = selected.status === 'delivered';
  const isPaid        = selected.status === 'paid';
  const isCancelled   = selected.status === 'cancelled';
  const isLocked      = isDelivered || isCancelled;

  // ── Inline status update (for manager/owner) ──────────────────────────────
  const handleStatusUpdate = (newStatus: any) => {
    if (isLocked) return;
    Alert.alert('Update Status', `Change to "${newStatus.replace(/_/g, ' ')}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Update', onPress: () => updateStatus(id, newStatus) },
    ]);
  };

  // ── Generate invoice (qc_passed → invoiced) ───────────────────────────────
  const handleGenerateInvoice = async () => {
    setGeneratingInvoice(true);
    try {
      const estimates = await estimateService.getByJobCard(id);
      const approved  = estimates.find(e => e.status === 'approved');
      if (!approved) {
        Alert.alert('No Approved Estimate', 'An approved estimate is required before generating an invoice.');
        return;
      }
      const inv = await invoiceService.generateFromEstimate(id, approved.id);
      await updateStatus(id, 'invoiced');
      await fetchById(id);
      Alert.alert(
        'Invoice Generated ✓',
        `Invoice ${inv.invoice_number} created for ₹${inv.total.toLocaleString('en-IN')}.\n\nProceed to collect payment.`,
        [
          { text: 'View Invoice', onPress: () => navigation.navigate('Invoice', { jobCardId: id }) },
          { text: 'OK' },
        ],
      );
    } catch (e: any) {
      Alert.alert('Failed', e.message ?? 'Could not generate invoice.');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  // ── Mark vehicle delivered (paid → delivered) ─────────────────────────────
  const handleDeliverVehicle = async () => {
    Alert.alert(
      'Deliver Vehicle',
      'Mark this vehicle as delivered? This will lock all editing on this job.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deliver',
          onPress: async () => {
            setDeliveringVehicle(true);
            try {
              await updateStatus(id, 'delivered');
              await fetchById(id);
              Alert.alert('Vehicle Delivered ✓', 'Job marked as delivered and locked.');
            } catch (e: any) {
              Alert.alert('Failed', e.message ?? 'Could not mark as delivered.');
            } finally {
              setDeliveringVehicle(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      {/* ── Delivery lock banner ── */}
      {isDelivered && (
        <View style={s.lockBanner}>
          <Ionicons name="lock-closed" size={16} color={COLORS.success} />
          <Text style={s.lockBannerText}>Vehicle delivered. This job is locked and read-only.</Text>
        </View>
      )}
      {isCancelled && (
        <View style={[s.lockBanner, s.cancelBanner]}>
          <Ionicons name="close-circle-outline" size={16} color={COLORS.danger} />
          <Text style={[s.lockBannerText, { color: COLORS.danger }]}>This job has been cancelled.</Text>
        </View>
      )}

      {/* ── Vehicle Card ── */}
      <Card style={s.vehicleCard}>
        <View style={s.vehicleHeader}>
          <View style={s.vehicleIconBox}>
            <Ionicons name="car" size={24} color={COLORS.primary} />
          </View>
          <View style={s.vehicleInfo}>
            <Text style={s.vehicleName}>{vehicleName}</Text>
            <Text style={s.plate}>{plate}</Text>
          </View>
          <JobStatusBadge status={selected.status} large />
        </View>

        <View style={s.divider} />

        <InfoRow icon="person-outline"      label="Customer"  value={customerName} />
        {customerMobile ? (
          <View style={s.infoRow}>
            <Ionicons name="call-outline" size={15} color={COLORS.textSecondary} />
            <Text style={s.infoLabel}>Mobile</Text>
            <PhoneMasked phone={customerMobile} style={s.infoValue} />
          </View>
        ) : null}
        {selected.mechanic && <InfoRow icon="construct-outline" label="Mechanic" value={selected.mechanic.name} />}
        {dateStr ? <InfoRow icon="calendar-outline" label="Check-in" value={new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} /> : null}
        <InfoRow icon="speedometer-outline" label="KMs"      value={`${selected.current_kms?.toLocaleString('en-IN') ?? '—'} km`} />
        <InfoRow icon="build-outline"       label="Work"     value={selected.work_type?.toUpperCase() ?? '—'} />
      </Card>

      {/* ── Pre-Trial (created status only) ── */}
      {selected.status === 'created' && (
        <Card style={s.section}>
          <View style={s.sectionRow}>
            <View>
              <Text style={s.sectionTitle}>Pre-Trial Checklist</Text>
              <Text style={s.sectionSub}>Complete before generating estimate</Text>
            </View>
            <TouchableOpacity
              style={[
                s.trialActionBtn,
                selected.inspections?.find(i => i.type === 'pre') && s.trialActionBtnDone,
              ]}
              onPress={() => navigation.navigate('Inspection', {
                jobCardId: id,
                type: 'pre',
                preInspection: selected.inspections?.find(i => i.type === 'pre') ?? null,
              })}
              activeOpacity={0.8}
            >
              <Ionicons
                name={selected.inspections?.find(i => i.type === 'pre') ? 'checkmark-circle' : 'clipboard-outline'}
                size={16}
                color={selected.inspections?.find(i => i.type === 'pre') ? COLORS.success : COLORS.primary}
              />
              <Text style={[
                s.trialActionBtnText,
                selected.inspections?.find(i => i.type === 'pre') && { color: COLORS.success },
              ]}>
                {selected.inspections?.find(i => i.type === 'pre') ? 'Done ✓' : 'Start'}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {/* ── Description ── */}
      {selected.description && (
        <Card style={s.section}>
          <Text style={s.sectionTitle}>Description</Text>
          <Text style={s.descText}>{selected.description}</Text>
        </Card>
      )}

      {/* ── Mechanic Assignment (manager/owner) ── */}
      {canAssignMechanic() && !isLocked && (
        <Card style={s.section}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Mechanic Assignment</Text>
            <Button
              title={selected.mechanic ? 'Reassign' : 'Assign'}
              onPress={() => navigation.navigate('AssignMechanic', { jobCardId: id })}
              variant="outline"
              size="sm"
            />
          </View>
          {selected.mechanic
            ? <Text style={s.assignedText}>Assigned to: {selected.mechanic.name}</Text>
            : <Text style={s.unassignedText}>⚠ No mechanic assigned</Text>
          }
        </Card>
      )}

      {/* ── Status Update (manager/owner in-progress stages) ── */}
      {(isMechanic || canAssignMechanic()) && !isLocked && (
        <Card style={s.section}>
          <Text style={s.sectionTitle}>Update Status</Text>
          <View style={s.statusGrid}>
            {(['in_progress', 'waiting_parts', 'work_completed'] as const).map(st => {
              const allowed = canTransition(selected.status, st);
              if (!allowed) return null;
              return (
                <TouchableOpacity
                  key={st}
                  style={[s.statusChip, selected.status === st && s.statusChipActive]}
                  onPress={() => handleStatusUpdate(st)}
                >
                  <Text style={[s.statusChipText, selected.status === st && s.statusChipTextActive]}>
                    {st.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      )}

      {/* ── QC Section ── */}
      {['work_completed', 'qc_pending', 'qc_failed', 'qc_passed'].includes(selected.status) && (
        <Card style={s.section}>
          <View style={s.sectionRow}>
            <View>
              <Text style={s.sectionTitle}>Quality Check (QC)</Text>
              <Text style={s.sectionSub}>Post-trial inspection</Text>
            </View>
            <TouchableOpacity
              style={[
                s.trialActionBtn,
                selected.status === 'qc_passed' && s.trialActionBtnDone,
                selected.status === 'qc_failed' && s.trialActionBtnFail,
              ]}
              onPress={() => navigation.navigate('Inspection', {
                jobCardId: id,
                type: 'post',
                preInspection: selected.inspections?.find(i => i.type === 'pre') ?? null,
              })}
              activeOpacity={0.8}
            >
              <Ionicons
                name={
                  selected.status === 'qc_passed' ? 'checkmark-circle' :
                  selected.status === 'qc_failed' ? 'warning-outline' : 'clipboard-outline'
                }
                size={16}
                color={
                  selected.status === 'qc_passed' ? COLORS.success :
                  selected.status === 'qc_failed' ? COLORS.danger : COLORS.primary
                }
              />
              <Text style={[
                s.trialActionBtnText,
                selected.status === 'qc_passed' && { color: COLORS.success },
                selected.status === 'qc_failed' && { color: COLORS.danger },
              ]}>
                {selected.status === 'qc_passed' ? 'Passed ✓' :
                 selected.status === 'qc_failed' ? 'Failed — Redo' : 'Start QC'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* QC status detail */}
          {selected.status === 'qc_failed' && (
            <View style={s.qcFailBanner}>
              <Ionicons name="alert-circle-outline" size={15} color={COLORS.danger} />
              <Text style={s.qcFailText}>QC failed — rework required before invoicing.</Text>
            </View>
          )}
          {selected.status === 'qc_passed' && (
            <View style={s.qcPassBanner}>
              <Ionicons name="checkmark-circle-outline" size={15} color={COLORS.success} />
              <Text style={s.qcPassText}>QC passed — ready to generate invoice.</Text>
            </View>
          )}
        </Card>
      )}

      {/* ── Generate Invoice (qc_passed only) ── */}
      {selected.status === 'qc_passed' && canViewFinancials() && (
        <TouchableOpacity
          style={s.generateInvoiceBtn}
          onPress={handleGenerateInvoice}
          disabled={generatingInvoice}
          activeOpacity={0.85}
        >
          {generatingInvoice
            ? <ActivityIndicator size="small" color="#fff" />
            : <Ionicons name="receipt-outline" size={20} color="#fff" />
          }
          <Text style={s.generateInvoiceText}>
            {generatingInvoice ? 'Generating...' : 'Generate Invoice'}
          </Text>
        </TouchableOpacity>
      )}

      {/* ── Deliver Vehicle (paid only) ── */}
      {isPaid && canViewFinancials() && (
        <TouchableOpacity
          style={s.deliverBtn}
          onPress={handleDeliverVehicle}
          disabled={deliveringVehicle}
          activeOpacity={0.85}
        >
          {deliveringVehicle
            ? <ActivityIndicator size="small" color="#fff" />
            : <Ionicons name="car-outline" size={20} color="#fff" />
          }
          <Text style={s.deliverBtnText}>
            {deliveringVehicle ? 'Processing...' : 'Mark Vehicle Delivered'}
          </Text>
        </TouchableOpacity>
      )}

      {/* ── Inspections (both types, always visible) ── */}
      <Card style={s.section}>
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Inspections</Text>
        </View>
        <View style={s.trialRow}>
          <TouchableOpacity
            style={s.trialBtn}
            onPress={() => navigation.navigate('Inspection', {
              jobCardId: id,
              type: 'pre',
              preInspection: selected.inspections?.find(i => i.type === 'pre') ?? null,
            })}
            activeOpacity={0.8}
          >
            <View style={[s.trialIcon, { backgroundColor: COLORS.primaryLight }]}>
              <Ionicons name="clipboard-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={s.trialLabel}>Pre-Trial</Text>
            <Text style={s.trialSub}>
              {selected.inspections?.find(i => i.type === 'pre') ? 'Done ✓' : 'Not done'}
            </Text>
          </TouchableOpacity>

          <View style={s.trialDivider} />

          <TouchableOpacity
            style={s.trialBtn}
            onPress={() => navigation.navigate('Inspection', {
              jobCardId: id,
              type: 'post',
              preInspection: selected.inspections?.find(i => i.type === 'pre') ?? null,
            })}
            activeOpacity={0.8}
          >
            <View style={[s.trialIcon, { backgroundColor: COLORS.successLight }]}>
              <Ionicons name="checkmark-done-outline" size={20} color={COLORS.success} />
            </View>
            <Text style={s.trialLabel}>Post-Trial</Text>
            <Text style={s.trialSub}>
              {selected.inspections?.find(i => i.type === 'post') ? 'Done ✓' : 'After work'}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* ── Financial actions (owner/manager) ── */}
      {!isMechanic && (
        <View style={s.actionsGrid}>
          {canApproveEstimate() && (
            <TouchableOpacity style={s.actionCard} onPress={() => navigation.navigate('Estimate', { jobCardId: id })}>
              <View style={[s.actionIcon, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="document-text-outline" size={22} color={COLORS.primary} />
              </View>
              <Text style={s.actionLabel}>Estimate</Text>
            </TouchableOpacity>
          )}
          {canViewFinancials() && (
            <>
              <TouchableOpacity style={s.actionCard} onPress={() => navigation.navigate('Invoice', { jobCardId: id })}>
                <View style={[s.actionIcon, { backgroundColor: COLORS.successLight }]}>
                  <Ionicons name="receipt-outline" size={22} color={COLORS.success} />
                </View>
                <Text style={s.actionLabel}>Invoice</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.actionCard} onPress={() => navigation.navigate('Payment', { jobCardId: id })}>
                <View style={[s.actionIcon, { backgroundColor: COLORS.warningLight }]}>
                  <Ionicons name="cash-outline" size={22} color={COLORS.warning} />
                </View>
                <Text style={s.actionLabel}>Payment</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:          { flex: 1, backgroundColor: COLORS.background },
  content:            { padding: SPACING.md, paddingBottom: 100 },

  lockBanner:         { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.successLight, borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.success },
  cancelBanner:       { backgroundColor: COLORS.dangerLight, borderColor: COLORS.danger },
  lockBannerText:     { flex: 1, fontSize: FONT.sizes.sm, color: COLORS.success, fontWeight: '600' },

  vehicleCard:        { marginBottom: SPACING.sm },
  vehicleHeader:      { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  vehicleIconBox:     { width: 48, height: 48, borderRadius: 12, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  vehicleInfo:        { flex: 1 },
  vehicleName:        { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  plate:              { fontSize: FONT.sizes.sm, color: COLORS.textSecondary },
  divider:            { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  infoRow:            { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 6 },
  infoLabel:          { fontSize: FONT.sizes.sm, color: COLORS.textMuted, width: 70 },
  infoValue:          { fontSize: FONT.sizes.sm, color: COLORS.text, fontWeight: '500', flex: 1 },

  section:            { marginBottom: SPACING.sm },
  sectionRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  sectionTitle:       { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  sectionSub:         { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  descText:           { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, lineHeight: 22 },

  assignedText:       { fontSize: FONT.sizes.sm, color: COLORS.success, fontWeight: '500' },
  unassignedText:     { fontSize: FONT.sizes.sm, color: COLORS.warning },

  statusGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  statusChip:         { paddingHorizontal: SPACING.sm, paddingVertical: 7, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.border },
  statusChipActive:   { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  statusChipText:     { fontSize: FONT.sizes.xs, fontWeight: '600', color: COLORS.textSecondary },
  statusChipTextActive:{ color: '#fff' },

  trialActionBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primaryLight, paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: RADIUS.full },
  trialActionBtnDone: { backgroundColor: COLORS.successLight },
  trialActionBtnFail: { backgroundColor: COLORS.dangerLight },
  trialActionBtnText: { fontSize: FONT.sizes.xs, fontWeight: '700', color: COLORS.primary },

  qcFailBanner:       { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, backgroundColor: COLORS.dangerLight, borderRadius: RADIUS.sm, padding: SPACING.sm, marginTop: SPACING.xs },
  qcFailText:         { flex: 1, fontSize: FONT.sizes.xs, color: COLORS.danger, fontWeight: '600' },
  qcPassBanner:       { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, backgroundColor: COLORS.successLight, borderRadius: RADIUS.sm, padding: SPACING.sm, marginTop: SPACING.xs },
  qcPassText:         { flex: 1, fontSize: FONT.sizes.xs, color: COLORS.success, fontWeight: '600' },

  generateInvoiceBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm },
  generateInvoiceText:{ fontSize: FONT.sizes.md, fontWeight: '700', color: '#fff' },

  deliverBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.success, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm },
  deliverBtnText:     { fontSize: FONT.sizes.md, fontWeight: '700', color: '#fff' },

  trialRow:           { flexDirection: 'row', alignItems: 'stretch' },
  trialBtn:           { flex: 1, alignItems: 'center', paddingVertical: SPACING.sm, gap: 4 },
  trialIcon:          { width: 44, height: 44, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  trialLabel:         { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.text },
  trialSub:           { fontSize: FONT.sizes.xs, color: COLORS.textMuted },
  trialDivider:       { width: 1, backgroundColor: COLORS.border, marginVertical: SPACING.xs },

  actionsGrid:        { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  actionCard:         { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', gap: SPACING.xs, ...SHADOW.sm },
  actionIcon:         { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionLabel:        { fontSize: FONT.sizes.xs, fontWeight: '700', color: COLORS.text },
});
