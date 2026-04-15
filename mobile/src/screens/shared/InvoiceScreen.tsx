import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/common/Button';
import { dummyInvoices } from '../../dummy/invoices';
import { dummyCompany } from '../../dummy/users';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

export const InvoiceScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { jobCardId } = route.params;
  const { canViewFinancials } = useAuthStore();

  const invoice = dummyInvoices.find(i => i.job_card_id === jobCardId || i.jobCardId === jobCardId);

  if (!canViewFinancials()) {
    return (
      <View style={s.restricted}>
        <Ionicons name="lock-closed-outline" size={48} color={COLORS.textMuted} />
        <Text style={s.restrictedText}>You don't have permission to view invoices</Text>
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={s.restricted}>
        <Ionicons name="document-outline" size={48} color={COLORS.textMuted} />
        <Text style={s.restrictedText}>No invoice found for this job</Text>
        <Button title="Create Invoice" onPress={() => Alert.alert('Create Invoice', 'Invoice creation coming soon')} style={{ marginTop: SPACING.md }} />
      </View>
    );
  }

  const isPaid = invoice.status === 'paid' || invoice.status === 'PAID';

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        {/* Invoice Header */}
        <View style={s.invoiceHeader}>
          <View>
            <Text style={s.invoiceNum}>{invoice.invoice_number}</Text>
            <Text style={s.invoiceDate}>{invoice.issued_at ? new Date(invoice.issued_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: isPaid ? COLORS.successLight : COLORS.warningLight }]}>
            <Text style={[s.statusText, { color: isPaid ? COLORS.success : COLORS.warning }]}>
              {invoice.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Company */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>From</Text>
          <Text style={s.companyName}>{dummyCompany.name}</Text>
          <Text style={s.companyDetail}>{dummyCompany.address}</Text>
          <Text style={s.companyDetail}>GST: {dummyCompany.gst_number}</Text>
        </View>

        {/* Items */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Items</Text>
          {invoice.items.map((item, idx) => (
            <View key={idx} style={s.itemRow}>
              <View style={s.itemLeft}>
                <Text style={s.itemName}>{item.name}</Text>
                <Text style={s.itemMeta}>{item.quantity} × ₹{item.unit_price.toLocaleString('en-IN')}</Text>
              </View>
              <Text style={s.itemAmount}>₹{item.amount.toLocaleString('en-IN')}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={s.totalsCard}>
          <View style={s.totalRow}><Text style={s.totalLabel}>Subtotal</Text><Text style={s.totalValue}>₹{invoice.subtotal.toLocaleString('en-IN')}</Text></View>
          <View style={s.totalRow}><Text style={s.totalLabel}>GST</Text><Text style={s.totalValue}>₹{invoice.gst_amount.toLocaleString('en-IN')}</Text></View>
          {invoice.discount > 0 && <View style={s.totalRow}><Text style={s.totalLabel}>Discount</Text><Text style={[s.totalValue, { color: COLORS.success }]}>-₹{invoice.discount.toLocaleString('en-IN')}</Text></View>}
          <View style={s.divider} />
          <View style={s.totalRow}><Text style={s.grandLabel}>Total</Text><Text style={s.grandValue}>₹{invoice.total.toLocaleString('en-IN')}</Text></View>
          {invoice.advance_paid > 0 && <View style={s.totalRow}><Text style={s.totalLabel}>Advance Paid</Text><Text style={[s.totalValue, { color: COLORS.success }]}>₹{invoice.advance_paid.toLocaleString('en-IN')}</Text></View>}
          <View style={s.totalRow}><Text style={s.balanceLabel}>Balance Due</Text><Text style={[s.balanceValue, { color: invoice.balance_due > 0 ? COLORS.danger : COLORS.success }]}>₹{invoice.balance_due.toLocaleString('en-IN')}</Text></View>
        </View>

        {/* Bank Details */}
        {dummyCompany.bank_details && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Bank Details</Text>
            <Text style={s.bankText}>{dummyCompany.bank_details.bank_name} · {dummyCompany.bank_details.account_number}</Text>
            <Text style={s.bankText}>IFSC: {dummyCompany.bank_details.ifsc_code}</Text>
            {dummyCompany.bank_details.upi_id && <Text style={s.bankText}>UPI: {dummyCompany.bank_details.upi_id}</Text>}
          </View>
        )}
      </ScrollView>

      {/* Actions */}
      <View style={s.footer}>
        <TouchableOpacity style={s.shareBtn} onPress={() => Alert.alert('Share', 'WhatsApp share coming soon')}>
          <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
          <Text style={[s.shareBtnText, { color: '#25D366' }]}>WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.shareBtn} onPress={() => Alert.alert('Download', 'PDF download coming soon')}>
          <Ionicons name="download-outline" size={20} color={COLORS.primary} />
          <Text style={[s.shareBtnText, { color: COLORS.primary }]}>Download PDF</Text>
        </TouchableOpacity>
        {!isPaid && (
          <Button title="Record Payment" onPress={() => navigation.navigate('Payment', { jobCardId })} style={s.payBtn} />
        )}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingBottom: 100 },
  restricted: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, backgroundColor: COLORS.background },
  restrictedText: { fontSize: FONT.sizes.md, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.md },
  invoiceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm },
  invoiceNum: { fontSize: FONT.sizes.lg, fontWeight: '700', color: COLORS.text },
  invoiceDate: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full },
  statusText: { fontSize: FONT.sizes.xs, fontWeight: '700' },
  section: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm },
  sectionTitle: { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SPACING.sm, textTransform: 'uppercase' },
  companyName: { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  companyDetail: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: SPACING.xs, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  itemLeft: { flex: 1 },
  itemName: { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.text },
  itemMeta: { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  itemAmount: { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.text },
  totalsCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  totalLabel: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary },
  totalValue: { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.xs },
  grandLabel: { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  grandValue: { fontSize: FONT.sizes.xl, fontWeight: '800', color: COLORS.primary },
  balanceLabel: { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  balanceValue: { fontSize: FONT.sizes.lg, fontWeight: '800' },
  bankText: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginBottom: 2 },
  footer: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border, alignItems: 'center' },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: 8, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border },
  shareBtnText: { fontSize: FONT.sizes.xs, fontWeight: '700' },
  payBtn: { flex: 1 },
});
