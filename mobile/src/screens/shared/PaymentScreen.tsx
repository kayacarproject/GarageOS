import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { invoiceApi, HanaInvoice } from '../../api/invoiceApi';
import { paymentApi } from '../../api/paymentApi';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

// ─── Config ───────────────────────────────────────────────────────────────────

type PaymentMode = 'cash' | 'upi' | 'bank_transfer' | 'cheque';

const MODES: { key: PaymentMode; label: string; icon: any }[] = [
  { key: 'cash',          label: 'Cash',          icon: 'cash-outline' },
  { key: 'upi',           label: 'UPI',           icon: 'phone-portrait-outline' },
  { key: 'bank_transfer', label: 'Bank Transfer', icon: 'business-outline' },
  { key: 'cheque',        label: 'Cheque',        icon: 'document-text-outline' },
];

const REFERENCE_LABELS: Partial<Record<PaymentMode, string>> = {
  upi:           'UPI Transaction ID',
  bank_transfer: 'Bank Reference / UTR',
  cheque:        'Cheque Number',
};

function formatCurrency(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const Row: React.FC<{ label: string; value: string; valueStyle?: object }> = ({ label, value, valueStyle }) => (
  <View style={s.summaryRow}>
    <Text style={s.summaryLabel}>{label}</Text>
    <Text style={[s.summaryValue, valueStyle]}>{value}</Text>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export const PaymentScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { jobCardId, invoiceId } = route.params ?? {};
  const { user } = useAuthStore();

  const [invoice,    setInvoice]    = useState<HanaInvoice | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [processing, setProcessing] = useState(false);
  const [mode,       setMode]       = useState<PaymentMode>('cash');
  const [amountStr,  setAmountStr]  = useState('');
  const [reference,  setReference]  = useState('');

  // ─── Load invoice ──────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const inv = invoiceId
          ? await invoiceApi.getById(invoiceId)
          : await invoiceApi.getByJobCard(jobCardId);
        if (inv) {
          setInvoice(inv);
          setAmountStr(String(inv.balanceDue));
        }
      } catch (e: any) {
        Alert.alert('Error', e.message ?? 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    })();
  }, [jobCardId, invoiceId]);

  // ─── Derived state ─────────────────────────────────────────────────────────

  const balanceDue    = invoice?.balanceDue ?? 0;
  const enteredAmount = parseFloat(amountStr) || 0;
  const isFullPayment = enteredAmount > 0 && enteredAmount >= balanceDue;
  const needsReference = mode !== 'cash';

  // ─── Validation ────────────────────────────────────────────────────────────

  function validate(): string | null {
    if (!invoice)           return 'Invoice not loaded.';
    if (invoice.paymentStatus === 'paid') return 'Invoice is fully paid.';
    if (enteredAmount <= 0) return 'Amount must be greater than zero.';
    if (enteredAmount > balanceDue)
      return `Amount cannot exceed balance due of ${formatCurrency(balanceDue)}.`;
    if (needsReference && !reference.trim())
      return `${REFERENCE_LABELS[mode]} is required for ${mode.replace('_', ' ')} payments.`;
    return null;
  }

  // ─── Confirm handler ───────────────────────────────────────────────────────

  const handleConfirm = () => {
    const error = validate();
    if (error) { Alert.alert('Validation Error', error); return; }

    const modeLabel = mode.replace('_', ' ').toUpperCase();
    Alert.alert(
      'Confirm Payment',
      `Record ${formatCurrency(enteredAmount)} via ${modeLabel}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: processPayment },
      ],
    );
  };

  const processPayment = async () => {
    if (!invoice) return;
    setProcessing(true);
    try {
      const newAmountPaid = (invoice.amountPaid ?? 0) + enteredAmount;
      const newBalance    = invoice.grandTotal - newAmountPaid;
      const newStatus     = newBalance <= 0 ? 'paid' : 'partial';

      // 1. Record payment transaction
      await paymentApi.create({
        invoiceId:   invoice._id,
        jobcardId:   jobCardId,
        amount:      enteredAmount,
        mode,
        reference:   reference.trim() || undefined,
        purpose:     isFullPayment ? 'full' : (invoice.amountPaid > 0 ? 'balance' : 'partial'),
        collectedBy: user?.id ?? '',
        collectedAt: new Date().toISOString(),
      });

      // 2. Update invoice payment state
      await invoiceApi.recordPayment(invoice._id, {
        amountPaid:    newAmountPaid,
        balanceDue:    Math.max(0, newBalance),
        paymentStatus: newStatus,
      });

      const updated: HanaInvoice = {
        ...invoice,
        amountPaid:    newAmountPaid,
        balanceDue:    Math.max(0, newBalance),
        paymentStatus: newStatus,
      };
      setInvoice(updated);

      if (newStatus === 'paid') {
        Alert.alert(
          'Payment Complete ✓',
          `Invoice ${invoice.invoiceNumber} has been paid in full.`,
          [{ text: 'Done', onPress: () => navigation.navigate('Dashboard') }],
        );
      } else {
        Alert.alert(
          'Payment Recorded ✓',
          `${formatCurrency(enteredAmount)} received.\n\nRemaining balance: ${formatCurrency(Math.max(0, newBalance))}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      }
    } catch (e: any) {
      Alert.alert('Payment Failed', e.message ?? 'An error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // ─── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={s.loadingText}>Loading invoice...</Text>
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={s.centered}>
        <Ionicons name="document-outline" size={48} color={COLORS.textMuted} />
        <Text style={s.emptyText}>No invoice found for this job.</Text>
      </View>
    );
  }

  // ─── Paid guard ────────────────────────────────────────────────────────────

  if (invoice.paymentStatus === 'paid') {
    return (
      <View style={s.centered}>
        <Ionicons name="lock-closed" size={48} color={COLORS.success} />
        <Text style={[s.emptyText, { color: COLORS.success, marginTop: SPACING.sm }]}>
          Invoice Paid in Full
        </Text>
        <Text style={s.lockedSub}>{invoice.invoiceNumber} · {formatCurrency(invoice.grandTotal)}</Text>
      </View>
    );
  }

  // ─── Main UI ───────────────────────────────────────────────────────────────

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        {/* ── Invoice Summary Card ── */}
        <View style={s.summaryCard}>
          <View style={s.summaryHeader}>
            <View>
              <Text style={s.invoiceNumber}>{invoice.invoiceNumber}</Text>
              <Text style={s.invoiceStatus}>
                {invoice.paymentStatus === 'partial' ? 'Partially Paid' : 'Unpaid'}
              </Text>
            </View>
            <View style={[
              s.statusPill,
              { backgroundColor: invoice.paymentStatus === 'partial' ? COLORS.warningLight : COLORS.dangerLight },
            ]}>
              <Text style={[
                s.statusText,
                { color: invoice.paymentStatus === 'partial' ? COLORS.warning : COLORS.danger },
              ]}>
                {invoice.paymentStatus === 'partial' ? 'Partial' : 'Unpaid'}
              </Text>
            </View>
          </View>

          <View style={s.divider} />

          <Row label="Invoice Total" value={formatCurrency(invoice.grandTotal)} />
          {invoice.tax > 0 && (
            <Row label="Tax" value={formatCurrency(invoice.tax)} />
          )}
          {invoice.discount > 0 && (
            <Row label="Discount" value={`- ${formatCurrency(invoice.discount)}`} valueStyle={{ color: COLORS.success }} />
          )}
          {invoice.amountPaid > 0 && (
            <Row label="Amount Paid" value={`- ${formatCurrency(invoice.amountPaid)}`} valueStyle={{ color: COLORS.success }} />
          )}

          <View style={s.divider} />

          <View style={s.balanceRow}>
            <Text style={s.balanceLabel}>Balance Due</Text>
            <Text style={s.balanceValue}>{formatCurrency(balanceDue)}</Text>
          </View>
        </View>

        {/* ── Payment Amount ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Payment Amount</Text>
          <View style={[s.amountBox, enteredAmount > balanceDue && s.amountBoxError]}>
            <Text style={s.rupeeSign}>₹</Text>
            <TextInput
              style={s.amountInput}
              value={amountStr}
              onChangeText={setAmountStr}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={COLORS.textMuted}
              selectTextOnFocus
            />
          </View>

          {enteredAmount > balanceDue && (
            <Text style={s.errorText}>Amount exceeds balance due of {formatCurrency(balanceDue)}</Text>
          )}

          <View style={s.quickRow}>
            <TouchableOpacity style={s.quickBtn} onPress={() => setAmountStr(String(balanceDue))}>
              <Text style={s.quickBtnText}>Full  {formatCurrency(balanceDue)}</Text>
            </TouchableOpacity>
            {balanceDue > 1000 && (
              <TouchableOpacity style={s.quickBtn} onPress={() => setAmountStr(String(Math.round(balanceDue / 2)))}>
                <Text style={s.quickBtnText}>Half</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Payment Mode ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Payment Mode</Text>
          <View style={s.modeGrid}>
            {MODES.map(m => {
              const active = mode === m.key;
              return (
                <TouchableOpacity
                  key={m.key}
                  style={[s.modeCard, active && s.modeCardActive]}
                  onPress={() => { setMode(m.key); setReference(''); }}
                  activeOpacity={0.75}
                >
                  <Ionicons name={m.icon} size={22} color={active ? COLORS.primary : COLORS.textSecondary} />
                  <Text style={[s.modeLabel, active && s.modeLabelActive]}>{m.label}</Text>
                  {active && <View style={s.modeCheck}><Ionicons name="checkmark" size={12} color="#fff" /></View>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Reference Field (conditional) ── */}
        {needsReference && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>
              {REFERENCE_LABELS[mode]}
              <Text style={s.required}> *</Text>
            </Text>
            <TextInput
              style={s.refInput}
              value={reference}
              onChangeText={setReference}
              placeholder={`Enter ${REFERENCE_LABELS[mode]?.toLowerCase()}`}
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="characters"
            />
          </View>
        )}

        {/* ── Full payment notice ── */}
        {isFullPayment && (
          <View style={s.lockNotice}>
            <Ionicons name="lock-closed-outline" size={16} color={COLORS.success} />
            <Text style={s.lockNoticeText}>
              Full payment — invoice will be marked as paid
            </Text>
          </View>
        )}

      </ScrollView>

      {/* ── Footer CTA ── */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.confirmBtn, (processing || enteredAmount <= 0) && s.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={processing || enteredAmount <= 0}
          activeOpacity={0.85}
        >
          {processing
            ? <ActivityIndicator color="#fff" />
            : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={s.confirmText}>
                  Confirm {enteredAmount > 0 ? formatCurrency(enteredAmount) : ''}
                </Text>
              </>
            )
          }
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.background },
  content:     { padding: SPACING.md, paddingBottom: 110 },
  centered:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  loadingText: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginTop: SPACING.sm },
  emptyText:   { fontSize: FONT.sizes.md, fontWeight: '600', color: COLORS.textSecondary },
  lockedSub:   { fontSize: FONT.sizes.sm, color: COLORS.textMuted, marginTop: 4 },

  summaryCard:   { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  invoiceNumber: { fontSize: FONT.sizes.lg, fontWeight: '800', color: COLORS.text },
  invoiceStatus: { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  statusPill:    { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full },
  statusText:    { fontSize: FONT.sizes.xs, fontWeight: '700' },
  divider:       { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  summaryRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  summaryLabel:  { fontSize: FONT.sizes.sm, color: COLORS.textSecondary },
  summaryValue:  { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.text },
  balanceRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel:  { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  balanceValue:  { fontSize: FONT.sizes.xxl, fontWeight: '800', color: COLORS.danger },

  section:      { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm },
  sectionTitle: { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  required:     { color: COLORS.danger },

  amountBox:      { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md },
  amountBoxError: { borderColor: COLORS.danger },
  rupeeSign:      { fontSize: 28, fontWeight: '700', color: COLORS.primary, marginRight: 4 },
  amountInput:    { flex: 1, fontSize: 32, fontWeight: '800', color: COLORS.text, paddingVertical: SPACING.sm },
  errorText:      { fontSize: FONT.sizes.xs, color: COLORS.danger, marginTop: 4 },
  quickRow:       { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  quickBtn:       { flex: 1, paddingVertical: 8, borderRadius: RADIUS.sm, borderWidth: 1.5, borderColor: COLORS.primary, alignItems: 'center' },
  quickBtnText:   { fontSize: FONT.sizes.xs, color: COLORS.primary, fontWeight: '700' },

  modeGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  modeCard:       { flex: 1, minWidth: '45%', alignItems: 'center', padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 2, borderColor: COLORS.border, gap: 6, position: 'relative' },
  modeCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  modeLabel:      { fontSize: FONT.sizes.xs, fontWeight: '600', color: COLORS.textSecondary },
  modeLabelActive:{ color: COLORS.primary },
  modeCheck:      { position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },

  refInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.sm, fontSize: FONT.sizes.sm, color: COLORS.text },

  lockNotice:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.successLight, borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.sm },
  lockNoticeText: { flex: 1, fontSize: FONT.sizes.sm, color: COLORS.success, fontWeight: '600' },

  footer:             { padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  confirmBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.md },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmText:        { fontSize: FONT.sizes.md, fontWeight: '700', color: '#fff' },
});
