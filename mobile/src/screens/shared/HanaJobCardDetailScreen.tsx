import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Image, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { jobcardApi, HanaJobCard } from '../../api/jobcardApi';
import { invoiceApi, HanaInvoice } from '../../api/invoiceApi';
import { showToast } from '../../utils/toast';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  open:                 { label: 'Open',             color: '#92400E', bg: '#FEF3C7', dot: COLORS.warning },
  assigned:             { label: 'Assigned',         color: '#1E40AF', bg: '#DBEAFE', dot: COLORS.info    },
  in_progress:          { label: 'In Progress',      color: '#1E40AF', bg: '#DBEAFE', dot: COLORS.info    },
  completed:            { label: 'Completed',        color: '#065F46', bg: '#D1FAE5', dot: COLORS.success },
  cancelled:            { label: 'Cancelled',        color: '#991B1B', bg: '#FEE2E2', dot: COLORS.danger  },
  awaiting_approval:    { label: 'Awaiting Approval', color: '#92400E', bg: '#FEF3C7', dot: COLORS.warning },
  approved_for_invoice: { label: 'Approved',          color: '#065F46', bg: '#D1FAE5', dot: COLORS.success },
  revision_requested:   { label: 'Revision Needed',   color: '#991B1B', bg: '#FEE2E2', dot: COLORS.danger  },
};

// Transitions allowed in Hana job card flow
const HANA_TRANSITIONS: Record<string, string[]> = {
  open:                  ['assigned', 'in_progress', 'cancelled'],
  assigned:              ['in_progress', 'cancelled'],
  in_progress:           ['completed', 'cancelled'],
  awaiting_approval:     [],  // locked — mechanic sent estimate, waiting owner
  approved_for_invoice:  ['completed'],
  revision_requested:    ['in_progress'],
  completed:             [],
  cancelled:             [],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const InfoRow: React.FC<{ icon: any; label: string; value: string }> = ({ icon, label, value }) => (
  <View style={s.infoRow}>
    <Ionicons name={icon} size={15} color={COLORS.textSecondary} />
    <Text style={s.infoLabel}>{label}</Text>
    <Text style={s.infoValue}>{value}</Text>
  </View>
);

const HanaStatusBadge: React.FC<{ status: string; large?: boolean }> = ({ status, large }) => {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.open;
  return (
    <View style={[s.statusBadge, { backgroundColor: cfg.bg }, large && s.statusBadgeLg]}>
      <View style={[s.statusDot, { backgroundColor: cfg.dot }]} />
      <Text style={[s.statusBadgeText, { color: cfg.color }, large && s.statusBadgeTextLg]}>
        {cfg.label}
      </Text>
    </View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export const HanaJobCardDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route, navigation,
}) => {
  const { id } = route.params;
  const { canApproveEstimate, canAssignMechanic, canViewFinancials, user } = useAuthStore();

  const [jobCard,   setJobCard]   = useState<HanaJobCard | null>(null);
  const [invoice,   setInvoice]   = useState<HanaInvoice | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [updating,  setUpdating]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, inv] = await Promise.all([
        jobcardApi.getById(id),
        invoiceApi.getByJobCard(id).catch(() => null),
      ]);
      if (!data) showToast('Job card not found', 'error');
      else setJobCard(data);
      setInvoice(inv);
    } catch (e: any) {
      showToast(e.message ?? 'Failed to load job card', 'error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // ── Status update ──────────────────────────────────────────────────────────
  const handleStatusUpdate = (newStatus: string) => {
    if (!jobCard) return;
    const label = STATUS_CFG[newStatus]?.label ?? newStatus;
    Alert.alert(
      'Update Status',
      `Change status to "${label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            setUpdating(true);
            try {
              await jobcardApi.updateStatus(id, newStatus);
              setJobCard(prev => prev ? { ...prev, status: newStatus } : prev);
              showToast(`Status updated to ${label}`, 'success');
            } catch (e: any) {
              showToast(e.message ?? 'Failed to update status', 'error');
            } finally {
              setUpdating(false);
            }
          },
        },
      ],
    );
  };

  // ── Loading / not-found states ─────────────────────────────────────────────
  if (loading && !jobCard) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={s.centerText}>Loading job card…</Text>
      </View>
    );
  }

  if (!jobCard) {
    return (
      <View style={s.center}>
        <Ionicons name="document-text-outline" size={48} color={COLORS.textMuted} />
        <Text style={s.centerText}>Job card not found</Text>
      </View>
    );
  }

  const isCompleted          = jobCard.status === 'completed';
  const isCancelled          = jobCard.status === 'cancelled';
  const isAssigned           = jobCard.status === 'assigned' || jobCard.status === 'open';
  const isInProgress         = jobCard.status === 'in_progress';
  const isAwaitingApproval   = jobCard.status === 'awaiting_approval';
  const isApprovedForInvoice = jobCard.status === 'approved_for_invoice';
  const isRevisionRequested  = jobCard.status === 'revision_requested';
  const isLocked    = isCompleted || isCancelled || isAwaitingApproval;
  const isMechanic  = user?.role === 'MECHANIC';

  const allowedTransitions = HANA_TRANSITIONS[jobCard.status] ?? [];
  const shortId = jobCard._id.slice(-8).toUpperCase();
  const createdDate = jobCard.createdAt
    ? new Date(jobCard.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '—';

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Lock banners ── */}
      {isCompleted && (
        <View style={s.lockBanner}>
          <Ionicons name="lock-closed" size={16} color={COLORS.success} />
          <Text style={s.lockBannerText}>Job completed. This record is locked and read-only.</Text>
        </View>
      )}
      {isCancelled && (
        <View style={[s.lockBanner, s.cancelBanner]}>
          <Ionicons name="close-circle-outline" size={16} color={COLORS.danger} />
          <Text style={[s.lockBannerText, { color: COLORS.danger }]}>This job has been cancelled.</Text>
        </View>
      )}
      {isAwaitingApproval && (
        <View style={[s.lockBanner, { backgroundColor: COLORS.warningLight, borderColor: COLORS.warning }]}>
          <Ionicons name="time-outline" size={16} color={COLORS.warning} />
          <Text style={[s.lockBannerText, { color: COLORS.warning }]}>
            Awaiting owner approval — estimate submitted and locked.
          </Text>
        </View>
      )}
      {isRevisionRequested && (
        <View style={[s.lockBanner, s.cancelBanner]}>
          <Ionicons name="refresh-outline" size={16} color={COLORS.danger} />
          <Text style={[s.lockBannerText, { color: COLORS.danger }]}>
            Revision requested by owner — update estimate and resubmit.
          </Text>
        </View>
      )}
      {isApprovedForInvoice && (
        <View style={[s.lockBanner, { backgroundColor: COLORS.successLight, borderColor: COLORS.success }]}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={[s.lockBannerText, { color: COLORS.success }]}>
            Approved by owner — invoice can now be generated.
          </Text>
        </View>
      )}

      {/* ── Start Work CTA (mechanic, assigned jobs only) ── */}
      {isMechanic && isAssigned && (
        <TouchableOpacity
          style={s.startWorkBtn}
          disabled={updating}
          onPress={() => handleStatusUpdate('in_progress')}
          activeOpacity={0.85}
        >
          {updating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="play-circle" size={20} color="#fff" />
              <Text style={s.startWorkText}>Start Work</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* ── In Progress hint for mechanic ── */}
      {isMechanic && isInProgress && (
        <View style={[s.lockBanner, { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary }]}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
          <Text style={[s.lockBannerText, { color: COLORS.primary }]}>
            Work in progress — open Estimate below to add items and send for approval when done.
          </Text>
        </View>
      )}

      {/* ── Vehicle Card ── */}
      <Card style={s.vehicleCard}>
        <View style={s.vehicleHeader}>
          <View style={s.vehicleIconBox}>
            <Ionicons name="car" size={24} color={COLORS.primary} />
          </View>
          <View style={s.vehicleInfo}>
            <Text style={s.vehicleName}>
              {[jobCard.brand, jobCard.model].filter(Boolean).join(' ') || 'Vehicle'}
            </Text>
            <Text style={s.plate}>{jobCard.registrationNumber ?? '—'}</Text>
          </View>
          <HanaStatusBadge status={jobCard.status} large />
        </View>

        <View style={s.divider} />

        <InfoRow icon="calendar-outline"    label="Created"  value={createdDate} />
        <InfoRow icon="build-outline"       label="Work"     value={jobCard.workType ?? '—'} />
        {jobCard.currentKM && (
          <InfoRow
            icon="speedometer-outline"
            label="KMs"
            value={`${parseInt(jobCard.currentKM).toLocaleString('en-IN')} km`}
          />
        )}
        {jobCard.createdBy && (
          <InfoRow icon="person-outline" label="Created By" value={jobCard.createdBy} />
        )}
        <InfoRow icon="document-outline" label="Job ID" value={`#${shortId}`} />
      </Card>

      {/* ── Description ── */}
      {jobCard.description ? (
        <Card style={s.section}>
          <Text style={s.sectionTitle}>Description</Text>
          <Text style={s.descText}>{jobCard.description}</Text>
        </Card>
      ) : null}

      {/* ── Photos ── */}
      {jobCard.photos && jobCard.photos.length > 0 && (
        <Card style={s.section}>
          <Text style={s.sectionTitle}>Photos ({jobCard.photos.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.photoRow}>
            {jobCard.photos.map((uri, i) => (
              <Image key={i} source={{ uri }} style={s.photo} />
            ))}
          </ScrollView>
        </Card>
      )}

      {/* ── Status Update ── */}
      {!isLocked && allowedTransitions.length > 0 && (
        <Card style={s.section}>
          <Text style={s.sectionTitle}>Update Status</Text>
          <View style={s.statusGrid}>
            {allowedTransitions.map(st => (
              <TouchableOpacity
                key={st}
                style={[
                  s.statusChip,
                  jobCard.status === st && s.statusChipActive,
                  updating && s.statusChipDisabled,
                ]}
                onPress={() => handleStatusUpdate(st)}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Text style={[s.statusChipText, jobCard.status === st && s.statusChipTextActive]}>
                    {STATUS_CFG[st]?.label ?? st}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      )}

      {/* ── Mechanic Assignment ── */}
      {canAssignMechanic() && (
        <Card style={s.section}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Mechanic Assignment</Text>
            {!isLocked && (
              <Button
                title={jobCard.assignedMechanicName ? 'Reassign' : 'Assign'}
                onPress={() => navigation.navigate('HanaAssignMechanic', { jobCardId: id })}
                variant="outline"
                size="sm"
              />
            )}
          </View>
          {jobCard.assignedMechanicName ? (
            <View style={s.assignedRow}>
              <View style={[s.assignedDot, { backgroundColor: COLORS.success }]} />
              <Text style={s.assignedName}>
                Assigned to: <Text style={{ fontWeight: '700' }}>{jobCard.assignedMechanicName}</Text>
              </Text>
            </View>
          ) : (
            <Text style={s.unassignedText}>⚠ Tap Assign to allocate a mechanic</Text>
          )}
        </Card>
      )}

      {/* ── Inspections ── */}
      <Card style={s.section}>
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Inspections</Text>
        </View>
        <View style={s.trialRow}>
          {/* Pre-Trial */}
          <TouchableOpacity
            style={s.trialBtn}
            onPress={() => navigation.navigate('HanaInspection', { jobCardId: id, type: 'pre' })}
            activeOpacity={0.8}
          >
            <View style={[
              s.trialIcon,
              { backgroundColor: jobCard.inspections?.preTrial?.completed
                  ? COLORS.successLight : COLORS.primaryLight },
            ]}>
              <Ionicons
                name={jobCard.inspections?.preTrial?.completed
                  ? 'checkmark-circle' : 'clipboard-outline'}
                size={20}
                color={jobCard.inspections?.preTrial?.completed
                  ? COLORS.success : COLORS.primary}
              />
            </View>
            <Text style={s.trialLabel}>Pre-Trial</Text>
            <Text style={[
              s.trialSub,
              jobCard.inspections?.preTrial?.completed && { color: COLORS.success, fontWeight: '600' },
            ]}>
              {jobCard.inspections?.preTrial?.completed ? 'Completed ✓' : 'Before work'}
            </Text>
          </TouchableOpacity>

          <View style={s.trialDivider} />

          {/* Post-Trial */}
          <TouchableOpacity
            style={s.trialBtn}
            onPress={() => navigation.navigate('HanaInspection', { jobCardId: id, type: 'post' })}
            activeOpacity={0.8}
          >
            <View style={[
              s.trialIcon,
              { backgroundColor: jobCard.inspections?.postTrial?.completed
                  ? COLORS.successLight : COLORS.successLight },
            ]}>
              <Ionicons
                name={jobCard.inspections?.postTrial?.completed
                  ? 'checkmark-circle' : 'checkmark-done-outline'}
                size={20}
                color={COLORS.success}
              />
            </View>
            <Text style={s.trialLabel}>Post-Trial</Text>
            <Text style={[
              s.trialSub,
              jobCard.inspections?.postTrial?.completed && { color: COLORS.success, fontWeight: '600' },
            ]}>
              {jobCard.inspections?.postTrial?.completed ? 'Completed ✓' : 'After work'}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* ── Financial Actions ── */}
      {/* Payment status banner — non-mechanic only */}
      {!isMechanic && invoice && (
        <View style={[
          s.paymentBanner,
          invoice.paymentStatus === 'paid'    && s.paymentBannerPaid,
          invoice.paymentStatus === 'partial' && s.paymentBannerPartial,
          invoice.paymentStatus === 'unpaid'  && s.paymentBannerUnpaid,
        ]}>
          <Ionicons
            name={invoice.paymentStatus === 'paid' ? 'checkmark-circle' : 'cash-outline'}
            size={16}
            color={
              invoice.paymentStatus === 'paid'    ? COLORS.success :
              invoice.paymentStatus === 'partial' ? COLORS.warning : COLORS.danger
            }
          />
          <Text style={[
            s.paymentBannerText,
            invoice.paymentStatus === 'paid'    && { color: COLORS.success } ,
            invoice.paymentStatus === 'partial' && { color: COLORS.warning },
            invoice.paymentStatus === 'unpaid'  && { color: COLORS.danger },
          ]}>
            {invoice.paymentStatus === 'paid'
              ? `Invoice ${invoice.invoiceNumber} · Paid in Full`
              : invoice.paymentStatus === 'partial'
                ? `Invoice ${invoice.invoiceNumber} · Balance ₹${invoice.balanceDue.toLocaleString('en-IN')}`
                : `Invoice ${invoice.invoiceNumber} · Payment Pending ₹${invoice.balanceDue.toLocaleString('en-IN')}`
            }
          </Text>
        </View>
      )}

      <View style={s.actionsGrid}>
        {/* Estimate — visible to everyone including mechanic */}
        <TouchableOpacity
          style={s.actionCard}
          onPress={() => navigation.navigate('Estimate', { jobCardId: id })}
          activeOpacity={0.8}
        >
          <View style={[s.actionIcon, { backgroundColor: COLORS.primaryLight }]}>
            <Ionicons name="document-text-outline" size={22} color={COLORS.primary} />
          </View>
          <Text style={s.actionLabel}>Estimate</Text>
        </TouchableOpacity>

        {/* Invoice & Payment — owner/manager only */}
        {canViewFinancials() && (
          <>
            <TouchableOpacity
              style={s.actionCard}
              onPress={() => navigation.navigate('Invoice', { jobCardId: id })}
              activeOpacity={0.8}
            >
              <View style={[s.actionIcon, { backgroundColor: COLORS.successLight }]}>
                <Ionicons name="receipt-outline" size={22} color={COLORS.success} />
              </View>
              <Text style={s.actionLabel}>Invoice</Text>
              {invoice?.paymentStatus === 'paid' && (
                <View style={s.paidBadge}>
                  <Text style={s.paidBadgeText}>PAID</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={s.actionCard}
              onPress={() => navigation.navigate('Payment', { jobCardId: id })}
              activeOpacity={0.8}
            >
              <View style={[s.actionIcon, { backgroundColor: COLORS.warningLight }]}>
                <Ionicons name="cash-outline" size={22} color={COLORS.warning} />
              </View>
              <Text style={s.actionLabel}>Payment</Text>
              {invoice?.paymentStatus === 'partial' && (
                <View style={[s.paidBadge, { backgroundColor: COLORS.warningLight }]}>
                  <Text style={[s.paidBadgeText, { color: COLORS.warning }]}>PARTIAL</Text>
                </View>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content:   { padding: SPACING.md, paddingBottom: 100 },

  center:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  centerText: { fontSize: FONT.sizes.sm, color: COLORS.textMuted, marginTop: SPACING.xs },

  lockBanner:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.successLight, borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.success },
  cancelBanner:   { backgroundColor: COLORS.dangerLight, borderColor: COLORS.danger },
  lockBannerText: { flex: 1, fontSize: FONT.sizes.sm, color: COLORS.success, fontWeight: '600' },

  startWorkBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: 14, marginBottom: SPACING.sm },
  startWorkText: { fontSize: FONT.sizes.md, fontWeight: '700', color: '#fff' },

  vehicleCard:    { marginBottom: SPACING.sm },
  vehicleHeader:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  vehicleIconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  vehicleInfo:    { flex: 1 },
  vehicleName:    { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  plate:          { fontSize: FONT.sizes.sm, color: COLORS.textSecondary },
  divider:        { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  infoRow:        { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 6 },
  infoLabel:      { fontSize: FONT.sizes.sm, color: COLORS.textMuted, width: 75 },
  infoValue:      { fontSize: FONT.sizes.sm, color: COLORS.text, fontWeight: '500', flex: 1 },

  statusBadge:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full, alignSelf: 'flex-start', gap: 5 },
  statusBadgeLg:    { paddingHorizontal: SPACING.md, paddingVertical: 6 },
  statusDot:        { width: 7, height: 7, borderRadius: 4 },
  statusBadgeText:  { fontSize: FONT.sizes.xs, fontWeight: '600' },
  statusBadgeTextLg:{ fontSize: FONT.sizes.sm },

  section:         { marginBottom: SPACING.sm },
  sectionRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  sectionTitle:    { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  descText:        { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, lineHeight: 22, marginTop: SPACING.xs },

  statusGrid:           { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginTop: SPACING.xs },
  statusChip:           { paddingHorizontal: SPACING.sm, paddingVertical: 7, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.border },
  statusChipActive:     { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  statusChipDisabled:   { opacity: 0.5 },
  statusChipText:       { fontSize: FONT.sizes.xs, fontWeight: '600', color: COLORS.textSecondary },
  statusChipTextActive: { color: '#fff' },

  unassignedText: { fontSize: FONT.sizes.sm, color: COLORS.warning },
  assignedRow:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: SPACING.xs },
  assignedDot:    { width: 8, height: 8, borderRadius: 4 },
  assignedName:   { fontSize: FONT.sizes.sm, color: COLORS.text },

  trialRow:     { flexDirection: 'row', alignItems: 'stretch' },
  trialBtn:     { flex: 1, alignItems: 'center', paddingVertical: SPACING.sm, gap: 4 },
  trialIcon:    { width: 44, height: 44, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  trialLabel:   { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.text },
  trialSub:     { fontSize: FONT.sizes.xs, color: COLORS.textMuted },
  trialDivider: { width: 1, backgroundColor: COLORS.border, marginVertical: SPACING.xs },

  photoRow: { marginTop: SPACING.xs },
  photo:    { width: 90, height: 90, borderRadius: RADIUS.md, marginRight: SPACING.sm, backgroundColor: COLORS.border },

  actionsGrid: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  actionCard:  { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', gap: SPACING.xs, ...SHADOW.sm },
  actionIcon:  { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: FONT.sizes.xs, fontWeight: '700', color: COLORS.text },

  paymentBanner:        { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.xs },
  paymentBannerPaid:    { backgroundColor: COLORS.successLight },
  paymentBannerPartial: { backgroundColor: COLORS.warningLight },
  paymentBannerUnpaid:  { backgroundColor: COLORS.dangerLight },
  paymentBannerText:    { flex: 1, fontSize: FONT.sizes.xs, fontWeight: '600' },

  paidBadge:     { backgroundColor: COLORS.successLight, paddingHorizontal: 5, paddingVertical: 2, borderRadius: RADIUS.full },
  paidBadgeText: { fontSize: 8, fontWeight: '800', color: COLORS.success },
});
