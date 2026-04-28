import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/common/Button';
import { invoiceApi, HanaInvoice } from '../../api/invoiceApi';
import { estimateApi } from '../../api/estimateApi';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

export const InvoiceScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { jobCardId } = route.params;
  const { canViewFinancials, company, user } = useAuthStore();

  const [invoice,     setInvoice]     = useState<HanaInvoice | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [generating,  setGenerating]  = useState(false);

  useEffect(() => {
    load();
  }, [jobCardId]);

  const load = async () => {
    setLoading(true);
    try {
      const inv = await invoiceApi.getByJobCard(jobCardId);
      setInvoice(inv);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  // ── Generate invoice from approved estimate ────────────────────────────────

  const handleGenerateInvoice = async () => {
    setGenerating(true);
    try {
      const estimates = await estimateApi.getByJobCard(jobCardId);
      const approved = estimates.find(e => e.status === 'approved');

      if (!approved) {
        Alert.alert(
          'No Approved Estimate',
          'Please create and approve an estimate before generating an invoice.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Go to Estimate', onPress: () => navigation.navigate('Estimate', { jobCardId }) },
          ],
        );
        return;
      }

      const created = await invoiceApi.create({
        jobcardId:     jobCardId,
        estimateId:    approved._id,
        invoiceNumber: invoiceApi.generateInvoiceNumber(),
        items:         (approved.items ?? []).map(i => ({
          name:       i.name,
          quantity:   i.quantity,
          unit:       i.unit,
          unit_price: i.unit_price,
          amount:     i.amount,
        })),
        subtotal:      approved.subtotal,
        tax:           approved.tax ?? 0,
        discount:      approved.discount ?? 0,
        grandTotal:    approved.total,
        amountPaid:    0,
        balanceDue:    approved.total,
        paymentStatus: 'unpaid',
        createdBy:     user?.id ?? '',
      });

      // Re-fetch to get the full document with items populated
      const inv = await invoiceApi.getById(created._id) ?? created;
      setInvoice(inv);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to generate invoice');
    } finally {
      setGenerating(false);
    }
  };

  // ── Permission guard ──────────────────────────────────────────────────────

  if (!canViewFinancials()) {
    return (
      <View style={s.restricted}>
        <Ionicons name="lock-closed-outline" size={48} color={COLORS.textMuted} />
        <Text style={s.restrictedText}>You don't have permission to view invoices</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={s.restricted}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={s.restrictedText}>Loading invoice...</Text>
      </View>
    );
  }

  // ── No invoice yet — offer to generate ────────────────────────────────────

  if (!invoice) {
    return (
      <View style={s.restricted}>
        <Ionicons name="document-outline" size={48} color={COLORS.textMuted} />
        <Text style={s.restrictedTitle}>No Invoice Generated</Text>
        <Text style={s.restrictedText}>
          Approve an estimate first, then tap below to generate the invoice.
        </Text>
        <Button
          title={generating ? 'Generating...' : 'Generate Invoice'}
          onPress={handleGenerateInvoice}
          loading={generating}
          disabled={generating}
          style={{ marginTop: SPACING.md }}
          icon="receipt-outline"
        />
        <TouchableOpacity
          style={s.estLink}
          onPress={() => navigation.navigate('Estimate', { jobCardId })}
        >
          <Ionicons name="document-text-outline" size={16} color={COLORS.primary} />
          <Text style={s.estLinkText}>View / Create Estimate</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Invoice found — render ─────────────────────────────────────────────────

  const isPaid      = invoice.paymentStatus === 'paid';
  const isPartial   = invoice.paymentStatus === 'partial';
  const createdDate = invoice.createdAt
    ? new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  const paymentStatusLabel = isPaid ? 'PAID' : isPartial ? 'PARTIAL' : 'UNPAID';
  const paymentStatusColor = isPaid ? COLORS.success : isPartial ? COLORS.warning : COLORS.danger;
  const paymentStatusBg    = isPaid ? COLORS.successLight : isPartial ? COLORS.warningLight : COLORS.dangerLight;

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content}>

        {/* ── Invoice Header ── */}
        <View style={s.invoiceHeader}>
          <View>
            <Text style={s.invoiceNum}>{invoice.invoiceNumber}</Text>
            <Text style={s.invoiceDate}>{createdDate}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: paymentStatusBg }]}>
            <Text style={[s.statusText, { color: paymentStatusColor }]}>
              {paymentStatusLabel}
            </Text>
          </View>
        </View>

        {/* ── Company ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>From</Text>
          <Text style={s.companyName}>{company?.name ?? 'Garage'}</Text>
          {company?.address ? <Text style={s.companyDetail}>{company.address}</Text> : null}
          {company?.gst_number ? <Text style={s.companyDetail}>GST: {company.gst_number}</Text> : null}
        </View>

        {/* ── Items ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Items</Text>
          {(invoice.items ?? []).map((item, idx) => (
            <View key={idx} style={s.itemRow}>
              <View style={s.itemLeft}>
                <Text style={s.itemName}>{item.name}</Text>
                <Text style={s.itemMeta}>{item.quantity} × ₹{item.unit_price.toLocaleString('en-IN')}</Text>
              </View>
              <Text style={s.itemAmount}>₹{item.amount.toLocaleString('en-IN')}</Text>
            </View>
          ))}
        </View>

        {/* ── Totals ── */}
        <View style={s.totalsCard}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Subtotal</Text>
            <Text style={s.totalValue}>₹{invoice.subtotal.toLocaleString('en-IN')}</Text>
          </View>
          {invoice.tax > 0 && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Tax</Text>
              <Text style={s.totalValue}>₹{invoice.tax.toLocaleString('en-IN')}</Text>
            </View>
          )}
          {invoice.discount > 0 && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Discount</Text>
              <Text style={[s.totalValue, { color: COLORS.success }]}>
                -₹{invoice.discount.toLocaleString('en-IN')}
              </Text>
            </View>
          )}
          <View style={s.divider} />
          <View style={s.totalRow}>
            <Text style={s.grandLabel}>Total</Text>
            <Text style={s.grandValue}>₹{invoice.grandTotal.toLocaleString('en-IN')}</Text>
          </View>
          {invoice.amountPaid > 0 && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Amount Paid</Text>
              <Text style={[s.totalValue, { color: COLORS.success }]}>
                ₹{invoice.amountPaid.toLocaleString('en-IN')}
              </Text>
            </View>
          )}
          <View style={s.totalRow}>
            <Text style={s.balanceLabel}>Balance Due</Text>
            <Text style={[s.balanceValue, { color: invoice.balanceDue > 0 ? COLORS.danger : COLORS.success }]}>
              ₹{invoice.balanceDue.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* ── Bank Details ── */}
        {company?.bank_details && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Bank Details</Text>
            <Text style={s.bankText}>
              {company.bank_details.bank_name} · {company.bank_details.account_number}
            </Text>
            <Text style={s.bankText}>IFSC: {company.bank_details.ifsc_code}</Text>
            {(company.bank_details as any).upi_id && (
              <Text style={s.bankText}>UPI: {(company.bank_details as any).upi_id}</Text>
            )}
          </View>
        )}

      </ScrollView>

      {/* ── Footer Actions ── */}
      <View style={s.footer}>
        <TouchableOpacity
          style={s.shareBtn}
          onPress={() => Alert.alert('Share', 'WhatsApp share coming soon')}
        >
          <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
          <Text style={[s.shareBtnText, { color: '#25D366' }]}>WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.shareBtn}
          onPress={() => Alert.alert('Download', 'PDF download coming soon')}
        >
          <Ionicons name="download-outline" size={20} color={COLORS.primary} />
          <Text style={[s.shareBtnText, { color: COLORS.primary }]}>Download PDF</Text>
        </TouchableOpacity>
        {!isPaid && (
          <Button
            title="Record Payment"
            onPress={() => navigation.navigate('Payment', { jobCardId, invoiceId: invoice._id })}
            style={s.payBtn}
          />
        )}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.background },
  content:         { padding: SPACING.md, paddingBottom: 100 },

  restricted:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, backgroundColor: COLORS.background, gap: SPACING.sm },
  restrictedTitle: { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  restrictedText:  { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, textAlign: 'center' },

  estLink:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING.sm },
  estLinkText: { fontSize: FONT.sizes.sm, color: COLORS.primary, fontWeight: '600' },

  invoiceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm },
  invoiceNum:    { fontSize: FONT.sizes.lg, fontWeight: '700', color: COLORS.text },
  invoiceDate:   { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  statusBadge:   { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full },
  statusText:    { fontSize: FONT.sizes.xs, fontWeight: '700' },

  section:       { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm },
  sectionTitle:  { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SPACING.sm, textTransform: 'uppercase' },

  companyName:   { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  companyDetail: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },

  itemRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: SPACING.xs, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  itemLeft:   { flex: 1 },
  itemName:   { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.text },
  itemMeta:   { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  itemAmount: { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.text },

  totalsCard:   { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm },
  totalRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  totalLabel:   { fontSize: FONT.sizes.sm, color: COLORS.textSecondary },
  totalValue:   { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.text },
  divider:      { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.xs },
  grandLabel:   { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  grandValue:   { fontSize: FONT.sizes.xl, fontWeight: '800', color: COLORS.primary },
  balanceLabel: { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  balanceValue: { fontSize: FONT.sizes.lg, fontWeight: '800' },

  bankText: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginBottom: 2 },

  footer:      { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border, alignItems: 'center' },
  shareBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: 8, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border },
  shareBtnText:{ fontSize: FONT.sizes.xs, fontWeight: '700' },
  payBtn:      { flex: 1 },
});
