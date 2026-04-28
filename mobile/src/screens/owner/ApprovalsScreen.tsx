import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Modal, TextInput, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons }       from '@expo/vector-icons';
import { estimateApi, HanaEstimate } from '../../api/estimateApi';
import { jobcardApi }                from '../../api/jobcardApi';
import { useAuthStore }   from '../../stores/authStore';
import { EmptyState }     from '../../components/common/EmptyState';
import { showToast }      from '../../utils/toast';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

export const ApprovalsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();

  const [estimates,    setEstimates]    = useState<HanaEstimate[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // ── Reject modal ───────────────────────────────────────────────────────────
  const [rejectTarget, setRejectTarget] = useState<HanaEstimate | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting,    setRejecting]    = useState(false);

  // ── Load ───────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      const data = await estimateApi.getPendingApprovals();
      setEstimates(data);
    } catch {
      // silent
    }
  }, []);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  // ── Approve ────────────────────────────────────────────────────────────────
  const handleApprove = async (item: HanaEstimate) => {
    if (processingId) return;
    setProcessingId(item._id);
    try {
      await estimateApi.approve(item._id, user?.id ?? '');
      if (item.jobcardId) {
        await jobcardApi.updateJobCard(item.jobcardId, {
          approvalStatus:          'approved',
          status:                  'approved_for_invoice',
          approvalStatusUpdatedAt: new Date().toISOString(),
          approvalUpdatedBy:       user?.id ?? '',
        }).catch(() => {/* non-fatal */});
      }
      setEstimates(prev => prev.filter(e => e._id !== item._id));
      showToast('Estimate approved successfully', 'success');
    } catch {
      Alert.alert('Error', 'Could not approve. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  // ── Reject flow ────────────────────────────────────────────────────────────
  const openRejectModal = (item: HanaEstimate) => {
    setRejectTarget(item);
    setRejectReason('');
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    setRejecting(true);
    try {
      await estimateApi.reject(
        rejectTarget._id,
        user?.id ?? '',
        rejectReason.trim() || undefined,
      );
      if (rejectTarget.jobcardId) {
        await jobcardApi.updateJobCard(rejectTarget.jobcardId, {
          approvalStatus:          'rejected',
          status:                  'revision_requested',
          approvalStatusUpdatedAt: new Date().toISOString(),
          approvalUpdatedBy:       user?.id ?? '',
        }).catch(() => {/* non-fatal */});
      }
      setEstimates(prev => prev.filter(e => e._id !== rejectTarget._id));
      showToast('Estimate rejected', 'error');
      setRejectTarget(null);
    } catch {
      Alert.alert('Error', 'Could not reject. Please try again.');
    } finally {
      setRejecting(false);
    }
  };

  // ── Card ───────────────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: HanaEstimate }) => {
    const isProcessing = processingId === item._id;
    const gstAmount    = item.tax ?? Math.round(item.subtotal * 0.18);

    return (
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View>
            <Text style={s.jobNum}>
              JC: {item.jobcardId?.slice(-8).toUpperCase() ?? '—'}
            </Text>
            <Text style={s.vehicle}>
              {item.vehicleName ?? item.registrationNumber ?? '—'}
            </Text>
            {!!(item.requestedByRole || item.requestedByUserId) && (
              <View style={s.mechanicRow}>
                <Ionicons name="person-outline" size={11} color={COLORS.textMuted} />
                <Text style={s.mechanicText}>
                  {item.requestedByRole ?? 'mechanic'}
                  {item.createdBy ? ` · ${item.createdBy}` : ''}
                </Text>
              </View>
            )}
            {!!item.sentForApprovalAt && (
              <Text style={s.requestedAt}>
                {new Date(item.sentForApprovalAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                })}
              </Text>
            )}
          </View>
          <View style={s.totalBox}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalValue}>₹{(item.total || 0).toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <View style={s.itemsList}>
          {item.items.slice(0, 3).map((it, idx) => (
            <View key={idx} style={s.itemRow}>
              <Text style={s.itemName} numberOfLines={1}>{it.name}</Text>
              <Text style={s.itemAmt}>₹{(it.amount || 0).toLocaleString('en-IN')}</Text>
            </View>
          ))}
          {item.items.length > 3 && (
            <Text style={s.moreItems}>+{item.items.length - 3} more items</Text>
          )}
        </View>

        <View style={s.totalsRow}>
          <Text style={s.subtotalText}>
            Subtotal ₹{(item.subtotal || 0).toLocaleString('en-IN')}
          </Text>
          <Text style={s.gstText}>
            GST ₹{gstAmount.toLocaleString('en-IN')}
          </Text>
        </View>

        <View style={s.actions}>
          <TouchableOpacity
            style={[s.rejectBtn, !!processingId && s.btnDisabled]}
            onPress={() => openRejectModal(item)}
            disabled={!!processingId}
          >
            <Ionicons name="close-outline" size={16} color={COLORS.danger} />
            <Text style={s.rejectText}>Reject</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.reviseBtn, !!processingId && s.btnDisabled]}
            onPress={() => navigation.navigate('ReviseEstimate', { estimate: item })}
            disabled={!!processingId}
          >
            <Ionicons name="create-outline" size={16} color={COLORS.warning} />
            <Text style={s.reviseText}>Revise</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.approveBtn, isProcessing && s.btnDisabled]}
            onPress={() => handleApprove(item)}
            disabled={!!processingId}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-outline" size={16} color="#fff" />
                <Text style={s.approveText}>Approve</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && estimates.length === 0) {
    return (
      <View style={s.loadingScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <FlatList
        data={estimates}
        keyExtractor={i => i._id}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="All clear!"
            message="No estimates pending approval"
            icon="checkmark-circle-outline"
          />
        }
      />

      {/* ── Reject reason modal ── */}
      <Modal
        visible={!!rejectTarget}
        transparent
        animationType="slide"
        onRequestClose={() => !rejecting && setRejectTarget(null)}
      >
        <KeyboardAvoidingView
          style={s.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Reject Estimate</Text>
            <Text style={s.modalSub}>
              {rejectTarget?.vehicleName ?? rejectTarget?.registrationNumber ?? 'Estimate'}
            </Text>

            <TextInput
              style={s.reasonInput}
              placeholder="Reason for rejection (optional)"
              placeholderTextColor={COLORS.textMuted}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!rejecting}
            />

            <View style={s.modalActions}>
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={() => !rejecting && setRejectTarget(null)}
                disabled={rejecting}
              >
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.confirmRejectBtn, rejecting && s.btnDisabled]}
                onPress={confirmReject}
                disabled={rejecting}
              >
                {rejecting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={s.confirmRejectText}>Reject</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  list:         { padding: SPACING.md, paddingBottom: 40 },
  loadingScreen:{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },

  card:       { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  jobNum:     { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  vehicle:    { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  totalBox:   { alignItems: 'flex-end' },
  totalLabel: { fontSize: FONT.sizes.xs, color: COLORS.textMuted },
  totalValue: { fontSize: FONT.sizes.lg, fontWeight: '700', color: COLORS.text },

  itemsList: { backgroundColor: COLORS.background, borderRadius: RADIUS.sm, padding: SPACING.sm, marginBottom: SPACING.sm },
  itemRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemName:  { fontSize: FONT.sizes.sm, color: COLORS.text, flex: 1 },
  itemAmt:   { fontSize: FONT.sizes.sm, color: COLORS.text, fontWeight: '600' },
  moreItems: { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 2 },

  totalsRow:    { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.sm },
  subtotalText: { fontSize: FONT.sizes.xs, color: COLORS.textSecondary },
  gstText:      { fontSize: FONT.sizes.xs, color: COLORS.textSecondary },

  actions:    { flexDirection: 'row', gap: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm },
  btnDisabled:{ opacity: 0.5 },
  rejectBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: RADIUS.sm, borderWidth: 1.5, borderColor: COLORS.danger },
  rejectText: { fontSize: FONT.sizes.sm, color: COLORS.danger, fontWeight: '600' },
  reviseBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: RADIUS.sm, borderWidth: 1.5, borderColor: COLORS.warning },
  reviseText: { fontSize: FONT.sizes.sm, color: COLORS.warning, fontWeight: '600' },
  approveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: RADIUS.sm, backgroundColor: COLORS.success },
  approveText:{ fontSize: FONT.sizes.sm, color: '#fff', fontWeight: '600' },

  // Modal
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet:       { backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.lg, paddingBottom: 36 },
  modalHandle:      { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: SPACING.md },
  modalTitle:       { fontSize: FONT.sizes.lg, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  modalSub:         { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.md },
  reasonInput:      { backgroundColor: COLORS.background, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.sm, fontSize: FONT.sizes.sm, color: COLORS.text, minHeight: 80, marginBottom: SPACING.md },
  modalActions:     { flexDirection: 'row', gap: SPACING.sm },
  cancelBtn:        { flex: 1, paddingVertical: 12, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  cancelText:       { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, fontWeight: '600' },
  confirmRejectBtn: { flex: 1, paddingVertical: 12, borderRadius: RADIUS.md, backgroundColor: COLORS.danger, alignItems: 'center', justifyContent: 'center' },
  confirmRejectText:{ fontSize: FONT.sizes.sm, color: '#fff', fontWeight: '700' },

  mechanicRow:  { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  mechanicText: { fontSize: FONT.sizes.xs, color: COLORS.textMuted },
  requestedAt:  { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 1 },
});
