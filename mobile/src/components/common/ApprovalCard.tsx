import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';
import type { Approval } from '../../api/approvalApi';

// ─── Label / icon maps ────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  estimate:       'Estimate Approval',
  payment:        'Payment Approval',
  job_completion: 'Job Completion',
  booking:        'Booking Approval',
  expense:        'Expense Approval',
  leave:          'Leave Request',
};

const TYPE_ICONS: Record<string, string> = {
  estimate:       'document-text-outline',
  payment:        'card-outline',
  job_completion: 'checkmark-circle-outline',
  booking:        'calendar-outline',
  expense:        'receipt-outline',
  leave:          'person-outline',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface ApprovalCardProps {
  approval: Approval;
  /** True while the approve/reject API call is in-flight for this card. */
  processing: boolean;
  onApprove: () => void;
  onReject: () => void;
  /** Optional — hides the Details button when undefined. */
  onViewDetails?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  approval,
  processing,
  onApprove,
  onReject,
  onViewDetails,
}) => {
  const typeLabel = TYPE_LABELS[approval.type] ?? approval.type;
  const typeIcon  = TYPE_ICONS[approval.type]  ?? 'help-circle-outline';

  const dateLabel = approval.createdAt
    ? new Date(approval.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      })
    : '';

  return (
    <View style={s.card}>
      {/* ── Top row: type pill + date ── */}
      <View style={s.topRow}>
        <View style={s.typePill}>
          <Ionicons name={typeIcon as any} size={11} color={COLORS.warning} />
          <Text style={s.typeLabel}>{typeLabel}</Text>
        </View>
        {!!dateLabel && <Text style={s.date}>{dateLabel}</Text>}
      </View>

      {/* ── Title & description ── */}
      {!!approval.title && <Text style={s.title}>{approval.title}</Text>}
      {!!approval.description && (
        <Text style={s.description} numberOfLines={2}>{approval.description}</Text>
      )}

      {/* ── Requested by ── */}
      {!!approval.requestedByName && (
        <View style={s.requestedRow}>
          <Ionicons name="person-outline" size={12} color={COLORS.textMuted} />
          <Text style={s.requestedBy}>Requested by {approval.requestedByName}</Text>
        </View>
      )}

      {/* ── Action buttons ── */}
      <View style={s.actions}>
        <View style={s.actionsLeft}>
          {/* Approve */}
          <TouchableOpacity
            style={[s.btn, s.approveBtn, processing && s.btnDisabled]}
            onPress={onApprove}
            disabled={processing}
            activeOpacity={0.8}
          >
            {processing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark" size={14} color="#fff" />
                <Text style={s.approveBtnText}>Approve</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Reject */}
          <TouchableOpacity
            style={[s.btn, s.rejectBtn, processing && s.btnDisabled]}
            onPress={onReject}
            disabled={processing}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={14} color={COLORS.danger} />
            <Text style={s.rejectBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>

        {/* Details link */}
        {onViewDetails && (
          <TouchableOpacity
            style={s.detailsBtn}
            onPress={onViewDetails}
            disabled={processing}
            activeOpacity={0.75}
          >
            <Text style={s.detailsBtnText}>Details</Text>
            <Ionicons name="chevron-forward" size={13} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.md,
    marginBottom:    SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
    ...SHADOW.sm,
  },

  // Top row
  topRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   SPACING.xs,
  },
  typePill: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             4,
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:    RADIUS.full,
  },
  typeLabel: {
    fontSize:   FONT.sizes.xs,
    fontWeight: '600',
    color:      COLORS.warning,
  },
  date: {
    fontSize: FONT.sizes.xs,
    color:    COLORS.textMuted,
  },

  // Content
  title: {
    fontSize:     FONT.sizes.md,
    fontWeight:   '700',
    color:        COLORS.text,
    marginBottom: 3,
  },
  description: {
    fontSize:     FONT.sizes.sm,
    color:        COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight:   18,
  },
  requestedRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
    marginBottom:  SPACING.sm,
  },
  requestedBy: {
    fontSize: FONT.sizes.xs,
    color:    COLORS.textMuted,
  },

  // Actions
  actions: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginTop:      SPACING.xs,
  },
  actionsLeft: {
    flexDirection: 'row',
    gap:           SPACING.sm,
  },
  btn: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              4,
    paddingHorizontal: SPACING.md,
    paddingVertical:  7,
    borderRadius:     RADIUS.md,
    minWidth:         80,
    justifyContent:   'center',
  },
  approveBtn: {
    backgroundColor: COLORS.success,
  },
  approveBtnText: {
    fontSize:   FONT.sizes.sm,
    fontWeight: '600',
    color:      '#fff',
  },
  rejectBtn: {
    backgroundColor: COLORS.dangerLight,
    borderWidth:     1,
    borderColor:     COLORS.danger,
  },
  rejectBtnText: {
    fontSize:   FONT.sizes.sm,
    fontWeight: '600',
    color:      COLORS.danger,
  },
  btnDisabled: {
    opacity: 0.55,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           2,
    paddingVertical: 4,
    paddingLeft:   SPACING.sm,
  },
  detailsBtnText: {
    fontSize:   FONT.sizes.sm,
    color:      COLORS.primary,
    fontWeight: '600',
  },
});
