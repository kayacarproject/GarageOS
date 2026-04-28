import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { estimateApi, HanaEstimate, HanaEstimateItem } from '../../api/estimateApi';
import { jobcardApi } from '../../api/jobcardApi';
import { shareEstimateWhatsApp, shareEstimatePdf } from '../../utils/estimatePdf';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const UNITS = ['-', 'Nos', 'Ltr', 'set', 'job', 'pcs', 'L', 'can', 'kg'];

function toWords(n: number): string {
  if (n === 0) return 'Zero Rupees only';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convert(num: number): string {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + convert(num % 100) : '');
    if (num < 100000) return convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + convert(num % 1000) : '');
    if (num < 10000000) return convert(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + convert(num % 100000) : '');
    return convert(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + convert(num % 10000000) : '');
  }

  const rupees = Math.floor(n);
  const paise  = Math.round((n - rupees) * 100);
  let result = convert(rupees) + ' Rupees';
  if (paise > 0) result += ' and ' + convert(paise) + ' Paise';
  return result + ' only';
}

// ─── Local item type (UI form state) ─────────────────────────────────────────

interface FormItem extends HanaEstimateItem {
  _key: string; // stable react key
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const TableHeader: React.FC = () => (
  <View style={t.headerRow}>
    <Text style={[t.th, t.colNum]}>#</Text>
    <Text style={[t.th, t.colName]}>Item Name</Text>
    <Text style={[t.th, t.colHsn]}>HSN/SAC</Text>
    <Text style={[t.th, t.colQty]}>Qty</Text>
    <Text style={[t.th, t.colUnit]}>Unit</Text>
    <Text style={[t.th, t.colPrice]}>Price/Unit (₹)</Text>
    <Text style={[t.th, t.colAmt]}>Amount(₹)</Text>
  </View>
);

const ReadOnlyRow: React.FC<{ item: FormItem; idx: number }> = ({ item, idx }) => (
  <View style={[t.dataRow, idx % 2 === 1 && t.dataRowAlt]}>
    <Text style={[t.td, t.colNum]}>{idx + 1}</Text>
    <Text style={[t.td, t.colName]} numberOfLines={2}>{item.name}</Text>
    <Text style={[t.td, t.colHsn]}>{item.hsn_sac ?? ''}</Text>
    <Text style={[t.td, t.colQty]}>{item.quantity}</Text>
    <Text style={[t.td, t.colUnit]}>{item.unit}</Text>
    <Text style={[t.td, t.colPrice]}>₹ {item.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
    <Text style={[t.td, t.colAmt, t.tdBold]}>₹ {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
  </View>
);

const EditableRow: React.FC<{
  item: FormItem;
  idx: number;
  onChange: (idx: number, field: keyof FormItem, value: any) => void;
  onRemove: (idx: number) => void;
}> = ({ item, idx, onChange, onRemove }) => (
  <View style={[t.dataRow, t.editRow, idx % 2 === 1 && t.dataRowAlt]}>
    <Text style={[t.td, t.colNum]}>{idx + 1}</Text>
    <TextInput
      style={[t.td, t.colName, t.editInput]}
      value={item.name}
      onChangeText={v => onChange(idx, 'name', v)}
      placeholder="Item name"
      placeholderTextColor={COLORS.textMuted}
      multiline
    />
    <TextInput
      style={[t.td, t.colHsn, t.editInput]}
      value={item.hsn_sac ?? ''}
      onChangeText={v => onChange(idx, 'hsn_sac', v)}
      placeholder="-"
      placeholderTextColor={COLORS.textMuted}
      keyboardType="numeric"
    />
    <TextInput
      style={[t.td, t.colQty, t.editInput]}
      value={String(item.quantity)}
      onChangeText={v => onChange(idx, 'quantity', parseFloat(v) || 0)}
      keyboardType="numeric"
    />
    <TouchableOpacity
      style={[t.td, t.colUnit, t.unitBtn]}
      onPress={() => {
        const cur = UNITS.indexOf(item.unit);
        onChange(idx, 'unit', UNITS[(cur + 1) % UNITS.length]);
      }}
    >
      <Text style={t.unitBtnText}>{item.unit}</Text>
    </TouchableOpacity>
    <TextInput
      style={[t.td, t.colPrice, t.editInput]}
      value={String(item.unit_price)}
      onChangeText={v => onChange(idx, 'unit_price', parseFloat(v) || 0)}
      keyboardType="numeric"
    />
    <View style={[t.td, t.colAmt, t.amtCell]}>
      <Text style={t.tdBold}>₹ {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
      <TouchableOpacity onPress={() => onRemove(idx)} style={t.removeBtn}>
        <Ionicons name="close-circle" size={14} color={COLORS.danger} />
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const EstimateScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { jobCardId } = route.params;
  const { canApproveEstimate, company, user } = useAuthStore();

  const [estimate, setEstimate]           = useState<HanaEstimate | null>(null);
  const [vehicleName, setVehicleName]     = useState('—');
  const [loadingEstimate, setLoadingEstimate] = useState(true);
  const [items, setItems]                 = useState<FormItem[]>([]);
  const [discount, setDiscount]           = useState(0);
  const [notes, setNotes]                 = useState('');
  const [saving, setSaving]               = useState(false);
  const [approving, setApproving]         = useState(false);
  const [rejecting, setRejecting]         = useState(false);
  const [sharing, setSharing]             = useState(false);

  // Load estimate + vehicle info
  useEffect(() => {
    (async () => {
      setLoadingEstimate(true);
      try {
        const [allEstimates, jobCard] = await Promise.all([
          estimateApi.getByJobCard(jobCardId),
          jobcardApi.getById(jobCardId).catch(() => null),
        ]);

        if (jobCard) {
          setVehicleName(
            [jobCard.brand, jobCard.model, jobCard.registrationNumber]
              .filter(Boolean).join(' ') || '—'
          );
        }

        const active = allEstimates
          .filter(e => e.status !== 'superseded')
          .sort((a, b) => (b.version ?? 0) - (a.version ?? 0))[0] ?? null;

        if (active) {
          setEstimate(active);
          setItems((active.items ?? []).map((item, i) => ({ ...item, _key: `${i}-${Date.now()}` })));
          setDiscount(active.discount ?? 0);
          setNotes(active.notes ?? '');
        } else if (jobCard?.basePrice) {
          // Auto-fill from jobcard pricing snapshot when no estimate exists yet
          const autoItems: FormItem[] = [
            {
              _key:       'auto-service',
              name:       jobCard.serviceName ?? jobCard.workType ?? 'Service Charge',
              hsn_sac:    '',
              type:       'labour',
              quantity:   1,
              unit:       'job',
              unit_price: jobCard.basePrice,
              amount:     jobCard.basePrice,
            },
          ];
          if ((jobCard.taxAmount ?? 0) > 0) {
            autoItems.push({
              _key:       'auto-tax',
              name:       `GST ${jobCard.taxPercent ?? 18}%`,
              hsn_sac:    '',
              type:       'labour',
              quantity:   1,
              unit:       'job',
              unit_price: jobCard.taxAmount!,
              amount:     jobCard.taxAmount!,
            });
          }
          setItems(autoItems);
        }
      } finally {
        setLoadingEstimate(false);
      }
    })();
  }, [jobCardId]);

  const isApproved        = estimate?.status === 'approved';
  const isRejected        = estimate?.status === 'rejected';
  const isPendingApproval = estimate?.status === 'pending_approval';
  // Read-only for everyone once submitted; owners can still quick-approve inline
  const isReadOnly = isApproved || isRejected || isPendingApproval;

  const subtotal  = items.reduce((s, i) => s + i.amount, 0);
  const total     = subtotal - discount;
  const totalQty  = items.reduce((s, i) => s + i.quantity, 0);

  const estimateNo   = estimate?._id?.slice(-8).toUpperCase() ?? '—';
  const estimateDate = estimate?.createdAt
    ? new Date(estimate.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const getPdfData = () => ({
    estimateNo,
    estimateDate,
    companyName:    company?.name ?? 'Garage',
    companyEmail:   company?.email,
    vehicleName,
    customerName:   '—',
    customerMobile: undefined as string | undefined,
    items,
    subtotal,
    discount,
    total,
    notes,
  });

  const handleShareWhatsApp = async () => {
    setSharing(true);
    try { await shareEstimateWhatsApp(getPdfData(), () => {}); }
    finally { setSharing(false); }
  };

  const handleSharePdf = async () => {
    setSharing(true);
    try { await shareEstimatePdf(getPdfData()); }
    finally { setSharing(false); }
  };

  const addItem = () => {
    setItems(prev => [...prev, {
      _key: Date.now().toString(),
      name: '', hsn_sac: '', type: 'part',
      quantity: 1, unit: 'Nos',
      unit_price: 0, amount: 0,
    }]);
  };

  const updateItem = (idx: number, field: keyof FormItem, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      if (field === 'quantity' || field === 'unit_price') {
        updated[idx].amount = (updated[idx].quantity ?? 1) * (updated[idx].unit_price ?? 0);
      }
      return updated;
    });
  };

  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  // ── Save draft ─────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (items.length === 0) {
      Alert.alert('No Items', 'Add at least one item before saving.');
      return;
    }
    setSaving(true);
    try {
      const cleanItems = items.map(({ _key, ...rest }) => rest);
      const sub   = cleanItems.reduce((s, i) => s + i.amount, 0);
      const total = sub - discount;
      const nextVersion = (estimate?.version ?? 0) + 1;

      if (estimate) {
        // Update existing draft
        await estimateApi.update(estimate._id, {
          items: cleanItems, subtotal: sub, discount, total, notes: notes.trim() || undefined,
        });
        setEstimate(prev => prev ? { ...prev, items: cleanItems, subtotal: sub, discount, total, notes } : prev);
        Alert.alert('Saved', `Estimate v${estimate.version} updated.`);
      } else {
        // Create new draft
        const saved = await estimateApi.create({
          jobcardId:  jobCardId,
          items:      cleanItems,
          subtotal:   sub,
          discount,
          total,
          notes:      notes.trim() || undefined,
          version:    nextVersion,
          status:     'draft',
          createdBy:  user?.legalname ?? user?.name ?? user?.id ?? '',
        });
        setEstimate(saved);
        setItems((saved.items ?? []).map((item, i) => ({ ...item, _key: `${i}-${Date.now()}` })));
        Alert.alert('Saved', `Estimate v${saved.version} saved.`);
      }
    } catch (e: any) {
      Alert.alert('Save Failed', e.message ?? 'Could not save estimate.');
    } finally {
      setSaving(false);
    }
  };

  // ── Send for Approval ──────────────────────────────────────────────────────
  // Works whether a draft already exists or not.
  // If no draft: creates the estimate + submits in one API call.
  // If draft exists: saves latest items then flips status.

  const handleSendForApproval = async () => {
    if (items.length === 0) {
      Alert.alert('No Items', 'Add at least one item before sending for approval.');
      return;
    }
    Alert.alert(
      'Send for Approval',
      `Send this estimate (₹ ${total.toLocaleString('en-IN')}) to the owner for review?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            setSaving(true);
            try {
              const cleanItems = items.map(({ _key, ...rest }) => rest);
              const sub = cleanItems.reduce((s, i) => s + i.amount, 0);
              const tot = sub - discount;

              if (estimate) {
                // Save latest items + flip status atomically
                await estimateApi.sendForApproval(estimate._id, {
                  items:              cleanItems,
                  subtotal:           sub,
                  discount,
                  total:              tot,
                  notes:              notes.trim() || undefined,
                  version:            estimate.version ?? 1,
                  createdBy:          user?.legalname ?? user?.name ?? user?.id,
                  requestedByRole:    user?.role ?? 'MECHANIC',
                  requestedByUserId:  user?.id,
                });
                // Also update jobcard so mechanic dashboard shows 'awaiting_approval'
                await jobcardApi.updateJobCard(jobCardId, {
                  approvalStatus: 'pending',
                  status:         'awaiting_approval',
                });
                setEstimate(prev =>
                  prev ? { ...prev, items: cleanItems, subtotal: sub, discount, total: tot, status: 'pending_approval' } : prev,
                );
              } else {
                // No draft yet — create directly as pending_approval
                const saved = await estimateApi.create({
                  jobcardId:         jobCardId,
                  items:             cleanItems,
                  subtotal:          sub,
                  discount,
                  total:             tot,
                  notes:             notes.trim() || undefined,
                  version:           1,
                  status:            'pending_approval',
                  createdBy:         user?.legalname ?? user?.name ?? user?.id ?? '',
                  sentForApprovalAt: new Date().toISOString(),
                });
                setEstimate(saved);
                setItems((saved.items ?? []).map((item, i) => ({ ...item, _key: `${i}-${Date.now()}` })));
              }

              Alert.alert(
                'Sent for Approval ✓',
                'Estimate has been sent to the owner for review.',
                [{ text: 'OK', onPress: () => navigation.goBack() }],
              );
            } catch (e: any) {
              Alert.alert('Failed', e.message ?? 'Could not send estimate.');
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  // ── Approve ────────────────────────────────────────────────────────────────

  const handleApprove = () => {
    if (!estimate) { Alert.alert('Save estimate first.'); return; }
    Alert.alert(
      'Approve Estimate',
      `Approve estimate for ₹ ${total.toLocaleString('en-IN')}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            setApproving(true);
            try {
              await estimateApi.updateStatus(estimate._id, 'approved', {
                approvedBy: user?.id ?? '',
                approvedAt: new Date().toISOString(),
              });
              setEstimate(prev => prev ? { ...prev, status: 'approved' } : prev);
              Alert.alert(
                'Estimate Approved ✓',
                'Estimate approved. You can now generate an invoice.',
                [{ text: 'OK', onPress: () => navigation.goBack() }],
              );
            } catch (e: any) {
              Alert.alert('Failed', e.message ?? 'Could not approve estimate.');
            } finally {
              setApproving(false);
            }
          },
        },
      ],
    );
  };

  // ── Reject ─────────────────────────────────────────────────────────────────

  const handleReject = () => {
    if (!estimate) return;
    Alert.alert(
      'Reject Estimate',
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revise Estimate',
          onPress: async () => {
            setRejecting(true);
            try {
              await estimateApi.updateStatus(estimate._id, 'rejected');
              setEstimate(null);
              setItems([]);
              setDiscount(0);
              setNotes('');
              Alert.alert('Revise', 'Estimate rejected. Add revised items and save a new draft.');
            } catch (e: any) {
              Alert.alert('Failed', e.message ?? 'Could not reject estimate.');
            } finally {
              setRejecting(false);
            }
          },
        },
        {
          text: 'Cancel Job',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Cancel Job',
              'Are you sure you want to cancel this job? This cannot be undone.',
              [
                { text: 'No', style: 'cancel' },
                {
                  text: 'Yes, Cancel Job',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await jobcardApi.updateStatus(jobCardId, 'cancelled');
                      Alert.alert('Job Cancelled', 'This job has been cancelled.', [
                        { text: 'OK', onPress: () => navigation.navigate('Jobs') },
                      ]);
                    } catch (e: any) {
                      Alert.alert('Failed', e.message ?? 'Could not cancel job.');
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loadingEstimate) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={s.loadingText}>Loading estimate...</Text>
      </View>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Pending approval banner */}
        {isPendingApproval && (
          <View style={s.pendingBanner}>
            <Ionicons name="time-outline" size={18} color={COLORS.warning} />
            <Text style={s.pendingText}>
              Submitted for owner approval — awaiting review.
            </Text>
          </View>
        )}

        {/* Rejected banner */}
        {isRejected && (
          <View style={s.rejectedBanner}>
            <Ionicons name="close-circle-outline" size={18} color={COLORS.danger} />
            <Text style={s.rejectedText}>
              {estimate?.rejectedReason
                ? `Rejected: ${estimate.rejectedReason}`
                : 'This estimate was rejected. Create a revised estimate.'}
            </Text>
          </View>
        )}

        {/* ── Estimate document ── */}
        <View style={s.document}>

          <Text style={s.docTitle}>Estimate</Text>

          {/* Company header */}
          <View style={s.companyBox}>
            <Text style={s.companyName}>{company?.name ?? 'Garage Name'}</Text>
            {company?.email && <Text style={s.companyEmail}>Email: {company.email}</Text>}
          </View>

          {/* Estimate meta */}
          <View style={s.metaTable}>
            <View style={s.metaLeft}>
              <Text style={s.metaHeading}>Estimate For:</Text>
              <Text style={s.metaValue}>{vehicleName}</Text>
            </View>
            <View style={s.metaRight}>
              <Text style={s.metaHeading}>Estimate Details:</Text>
              {estimate && (
                <>
                  <Text style={s.metaValue}>No: {estimateNo}</Text>
                  <Text style={s.metaValue}>v{estimate.version} · {estimateDate}</Text>
                </>
              )}
              {isPendingApproval && (
                <View style={[s.approvedBadge, { backgroundColor: COLORS.warningLight }]}>
                  <Ionicons name="time" size={12} color={COLORS.warning} />
                  <Text style={[s.approvedText, { color: COLORS.warning }]}>PENDING APPROVAL</Text>
                </View>
              )}
              {isApproved && (
                <View style={s.approvedBadge}>
                  <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
                  <Text style={s.approvedText}>APPROVED</Text>
                </View>
              )}
              {isRejected && (
                <View style={[s.approvedBadge, { backgroundColor: COLORS.dangerLight }]}>
                  <Ionicons name="close-circle" size={12} color={COLORS.danger} />
                  <Text style={[s.approvedText, { color: COLORS.danger }]}>REJECTED</Text>
                </View>
              )}
            </View>
          </View>

          {/* Line items table */}
          <View style={s.tableWrap}>
            <TableHeader />
            {items.map((item, idx) =>
              isReadOnly
                ? <ReadOnlyRow key={item._key} item={item} idx={idx} />
                : <EditableRow key={item._key} item={item} idx={idx} onChange={updateItem} onRemove={removeItem} />
            )}
            <View style={t.totalQtyRow}>
              <Text style={[t.td, t.colNum]} />
              <Text style={[t.td, t.colName]} />
              <Text style={[t.td, t.colHsn]} />
              <Text style={[t.td, t.colQty, t.tdBold]}>{totalQty}</Text>
              <Text style={[t.td, t.colUnit]} />
              <Text style={[t.td, t.colPrice]} />
              <Text style={[t.td, t.colAmt]} />
            </View>
          </View>

          {/* Add item button (editable only) */}
          {!isReadOnly && (
            <TouchableOpacity style={s.addItemBtn} onPress={addItem} activeOpacity={0.8}>
              <Ionicons name="add-circle-outline" size={16} color={COLORS.primary} />
              <Text style={s.addItemText}>Add Item</Text>
            </TouchableOpacity>
          )}

          {/* Totals */}
          <View style={s.totalsSection}>
            <View style={s.totalsLeft}>
              <View style={s.wordsBox}>
                <Text style={s.wordsLabel}>Estimate Amount In Words :</Text>
                <Text style={s.wordsValue}>{toWords(total)}</Text>
              </View>
            </View>
            <View style={s.totalsRight}>
              <View style={s.totalLine}>
                <Text style={s.totalLineLabel}>Sub Total</Text>
                <Text style={s.totalLineColon}>:</Text>
                <Text style={s.totalLineValue}>₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
              </View>
              {discount > 0 && (
                <View style={s.totalLine}>
                  <Text style={s.totalLineLabel}>Discount</Text>
                  <Text style={s.totalLineColon}>:</Text>
                  <Text style={[s.totalLineValue, { color: COLORS.success }]}>- ₹ {discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                </View>
              )}
              <View style={[s.totalLine, s.grandTotalLine]}>
                <Text style={s.grandLabel}>Total</Text>
                <Text style={s.totalLineColon}>:</Text>
                <Text style={s.grandValue}>₹ {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
              </View>
            </View>
          </View>

          {/* Discount input (editable only) */}
          {!isReadOnly && (
            <View style={s.discountRow}>
              <Text style={s.discountLabel}>Discount (₹)</Text>
              <TextInput
                style={s.discountInput}
                value={String(discount)}
                onChangeText={v => setDiscount(parseFloat(v) || 0)}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          )}

          {/* Notes / Terms */}
          <View style={s.termsBox}>
            <Text style={s.termsHeading}>Terms And Conditions:</Text>
            {isReadOnly ? (
              <Text style={s.termsText}>{notes || 'Thank you for doing business with us.'}</Text>
            ) : (
              <TextInput
                style={s.termsInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Thank you for doing business with us."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            )}
          </View>

          {/* Signature */}
          <View style={s.signatureRow}>
            <View style={s.signatureRight}>
              <Text style={s.signatureFor}>For {company?.name ?? 'Garage Name'}:</Text>
              <View style={s.signatureBox} />
              <Text style={s.signatureLabel}>Authorized Signatory</Text>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* ════════════════════════════════════════════════════════════════════
          FOOTER — buttons change based on ROLE + STATUS
          ════════════════════════════════════════════════════════════════════ */}
      <View style={s.footer}>

        {/* ─────────────────────────────────────────────────────────────────
            EDITABLE STATE  (draft / revised / no estimate yet)
            OWNER:      [Save Draft]  [Approve]  [Reject]
            MECHANIC:   [Save Draft]  [Send for Approval]
            ───────────────────────────────────────────────────────────────── */}
        {(estimate == null || estimate.status === 'draft' || estimate.status === 'revised') && (
          <View style={s.footerBtnRow}>

            {/* Save Draft — shown to everyone while editing */}
            <TouchableOpacity
              style={[s.footerBtn, s.saveBtn]}
              onPress={handleSave}
              disabled={saving || approving}
              activeOpacity={0.85}
            >
              {saving
                ? <ActivityIndicator size="small" color={COLORS.primary} />
                : <Ionicons name="save-outline" size={16} color={COLORS.primary} />
              }
              <Text style={s.saveBtnText}>Save Draft</Text>
            </TouchableOpacity>

            {/* ── MECHANIC / RECEPTIONIST: Send for Approval ── */}
            {!canApproveEstimate() && (
              <TouchableOpacity
                style={[s.footerBtn, s.sendBtn]}
                onPress={handleSendForApproval}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Ionicons name="send-outline" size={16} color="#fff" />
                }
                <Text style={s.sendBtnText}>Send for Approval</Text>
              </TouchableOpacity>
            )}

            {/* ── OWNER / MANAGER: Approve + Reject (direct, no queue) ── */}
            {canApproveEstimate() && estimate && (
              <>
                <TouchableOpacity
                  style={[s.footerBtn, s.approveBtn]}
                  onPress={handleApprove}
                  disabled={approving || saving}
                  activeOpacity={0.85}
                >
                  {approving
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                  }
                  <Text style={s.approveBtnText}>
                    {approving ? 'Approving...' : 'Approve'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.footerBtn, s.rejectBtn]}
                  onPress={handleReject}
                  disabled={rejecting || saving || approving}
                  activeOpacity={0.85}
                >
                  <Ionicons name="close-circle-outline" size={16} color={COLORS.danger} />
                  <Text style={s.rejectBtnText}>Reject</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            PENDING APPROVAL STATE
            MECHANIC:   [⏳ Waiting for Approval]   ← full width, disabled
            OWNER:      [Approve]  [Reject]          ← can act from here too
            ───────────────────────────────────────────────────────────────── */}
        {isPendingApproval && (
          <View style={s.footerBtnRow}>

            {/* Mechanic / Receptionist — read-only, just shows status */}
            {!canApproveEstimate() && (
              <View style={[s.footerBtn, s.waitingBtn]}>
                <Ionicons name="time-outline" size={16} color={COLORS.warning} />
                <Text style={s.waitingBtnText}>Waiting for Approval</Text>
              </View>
            )}

            {/* Owner / Manager — can approve or reject inline */}
            {canApproveEstimate() && (
              <>
                <TouchableOpacity
                  style={[s.footerBtn, s.approveBtn]}
                  onPress={handleApprove}
                  disabled={approving}
                  activeOpacity={0.85}
                >
                  {approving
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                  }
                  <Text style={s.approveBtnText}>
                    {approving ? 'Approving...' : 'Approve'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.footerBtn, s.rejectBtn]}
                  onPress={handleReject}
                  disabled={rejecting || approving}
                  activeOpacity={0.85}
                >
                  <Ionicons name="close-circle-outline" size={16} color={COLORS.danger} />
                  <Text style={s.rejectBtnText}>Reject</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            REJECTED STATE — mechanic sees rejection reason + revise option
            ───────────────────────────────────────────────────────────────── */}
        {isRejected && (
          <TouchableOpacity
            style={[s.footerBtn, s.sendBtn, { flex: 1 }]}
            onPress={() =>
              setEstimate(prev => prev ? { ...prev, status: 'revised' } : null)
            }
            activeOpacity={0.85}
          >
            <Ionicons name="refresh-outline" size={16} color="#fff" />
            <Text style={s.sendBtnText}>Revise & Resubmit</Text>
          </TouchableOpacity>
        )}

        {/* Share on WhatsApp — visible when estimate exists (any status) */}
        {estimate && (
          <View style={s.shareRow}>
            <TouchableOpacity
              style={s.whatsappBtn}
              onPress={handleShareWhatsApp}
              disabled={sharing}
              activeOpacity={0.85}
            >
              {sharing
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="logo-whatsapp" size={20} color="#fff" />
              }
              <Text style={s.whatsappBtnText}>
                {sharing ? 'Generating...' : 'Share on WhatsApp'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.pdfBtn}
              onPress={handleSharePdf}
              disabled={sharing}
              activeOpacity={0.85}
            >
              <Ionicons name="share-outline" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

// ─── Table styles ─────────────────────────────────────────────────────────────

const t = StyleSheet.create({
  headerRow:   { flexDirection: 'row', backgroundColor: '#f0f0f0', borderBottomWidth: 1, borderBottomColor: '#ccc', paddingVertical: 6, paddingHorizontal: 4 },
  dataRow:     { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#e0e0e0', paddingVertical: 5, paddingHorizontal: 4, alignItems: 'center' },
  dataRowAlt:  { backgroundColor: '#fafafa' },
  editRow:     { alignItems: 'flex-start' },
  totalQtyRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#ccc', paddingVertical: 5, paddingHorizontal: 4 },
  th:          { fontSize: 10, fontWeight: '700', color: '#333' },
  td:          { fontSize: 10, color: '#333' },
  tdBold:      { fontWeight: '700' },
  colNum:      { width: 18, textAlign: 'center' },
  colName:     { flex: 1, paddingRight: 4 },
  colHsn:      { width: 46, textAlign: 'center' },
  colQty:      { width: 30, textAlign: 'center' },
  colUnit:     { width: 30, textAlign: 'center' },
  colPrice:    { width: 72, textAlign: 'right' },
  colAmt:      { width: 72, textAlign: 'right' },
  editInput:   { borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: 2, minHeight: 22, color: COLORS.text },
  unitBtn:     { backgroundColor: COLORS.primaryLight, borderRadius: 3, paddingVertical: 2, alignItems: 'center' },
  unitBtnText: { fontSize: 9, color: COLORS.primary, fontWeight: '700' },
  amtCell:     { alignItems: 'flex-end', gap: 2 },
  removeBtn:   { marginTop: 2 },
});

// ─── Screen styles ────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#e8e8e8' },
  content:        { padding: SPACING.md, paddingBottom: 100 },
  centered:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  loadingText:    { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginTop: SPACING.sm },

  pendingBanner:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.warningLight, borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.sm },
  pendingText:    { flex: 1, fontSize: FONT.sizes.sm, color: COLORS.warning, fontWeight: '600' },
  rejectedBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.dangerLight, borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.sm },
  rejectedText:   { flex: 1, fontSize: FONT.sizes.sm, color: COLORS.danger, fontWeight: '600' },

  document:       { backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md, ...SHADOW.md },
  docTitle:       { fontSize: FONT.sizes.xl, fontWeight: '800', color: '#111', textAlign: 'center', marginBottom: SPACING.md, letterSpacing: 1 },
  companyBox:     { borderWidth: 1, borderColor: '#ccc', borderRadius: RADIUS.sm, padding: SPACING.sm, marginBottom: SPACING.sm },
  companyName:    { fontSize: FONT.sizes.md, fontWeight: '800', color: '#111' },
  companyEmail:   { fontSize: FONT.sizes.xs, color: '#555', marginTop: 2 },
  metaTable:      { flexDirection: 'row', borderWidth: 1, borderColor: '#ccc', borderRadius: RADIUS.sm, marginBottom: SPACING.sm, overflow: 'hidden' },
  metaLeft:       { flex: 1, padding: SPACING.sm, borderRightWidth: 1, borderRightColor: '#ccc' },
  metaRight:      { flex: 1, padding: SPACING.sm },
  metaHeading:    { fontSize: FONT.sizes.xs, fontWeight: '700', color: '#555', marginBottom: 4 },
  metaValue:      { fontSize: FONT.sizes.xs, color: '#111', fontWeight: '600', marginBottom: 2 },
  metaCustomer:   { fontSize: FONT.sizes.xs, color: '#555' },
  approvedBadge:  { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4, backgroundColor: COLORS.successLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.full, alignSelf: 'flex-start' },
  approvedText:   { fontSize: 9, fontWeight: '800', color: COLORS.success },
  tableWrap:      { borderWidth: 1, borderColor: '#ccc', borderRadius: RADIUS.sm, overflow: 'hidden', marginBottom: SPACING.sm },
  addItemBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, paddingVertical: SPACING.sm, borderWidth: 1.5, borderColor: COLORS.primary, borderStyle: 'dashed', borderRadius: RADIUS.sm, marginBottom: SPACING.sm },
  addItemText:    { fontSize: FONT.sizes.sm, color: COLORS.primary, fontWeight: '600' },
  totalsSection:  { flexDirection: 'row', borderWidth: 1, borderColor: '#ccc', borderRadius: RADIUS.sm, overflow: 'hidden', marginBottom: SPACING.sm },
  totalsLeft:     { flex: 1, padding: SPACING.sm, borderRightWidth: 1, borderRightColor: '#ccc', justifyContent: 'flex-end' },
  totalsRight:    { width: 200, padding: SPACING.sm },
  wordsBox:       {},
  wordsLabel:     { fontSize: 9, fontWeight: '700', color: '#555', marginBottom: 3 },
  wordsValue:     { fontSize: 9, color: '#111', lineHeight: 14 },
  totalLine:      { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  grandTotalLine: { borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 4, marginTop: 2 },
  totalLineLabel: { flex: 1, fontSize: FONT.sizes.xs, color: '#555', fontWeight: '600' },
  totalLineColon: { fontSize: FONT.sizes.xs, color: '#555', marginHorizontal: 4 },
  totalLineValue: { fontSize: FONT.sizes.xs, fontWeight: '700', color: '#111', minWidth: 80, textAlign: 'right' },
  grandLabel:     { flex: 1, fontSize: FONT.sizes.sm, fontWeight: '800', color: '#111' },
  grandValue:     { fontSize: FONT.sizes.sm, fontWeight: '800', color: '#111', minWidth: 80, textAlign: 'right' },
  discountRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: SPACING.sm, marginBottom: SPACING.sm },
  discountLabel:  { fontSize: FONT.sizes.sm, color: COLORS.textSecondary },
  discountInput:  { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm, paddingVertical: 4, fontSize: FONT.sizes.sm, color: COLORS.text, width: 80, textAlign: 'right' },
  termsBox:       { borderWidth: 1, borderColor: '#ccc', borderRadius: RADIUS.sm, padding: SPACING.sm, marginBottom: SPACING.sm },
  termsHeading:   { fontSize: FONT.sizes.xs, fontWeight: '700', color: '#555', marginBottom: 4 },
  termsText:      { fontSize: FONT.sizes.xs, color: '#333' },
  termsInput:     { fontSize: FONT.sizes.xs, color: COLORS.text, minHeight: 40 },
  signatureRow:   { flexDirection: 'row', justifyContent: 'flex-end' },
  signatureRight: { alignItems: 'center', minWidth: 140 },
  signatureFor:   { fontSize: FONT.sizes.xs, fontWeight: '700', color: '#333', marginBottom: SPACING.sm, alignSelf: 'flex-start' },
  signatureBox:   { width: 120, height: 60, borderWidth: 1, borderColor: '#ccc', borderRadius: RADIUS.sm, marginBottom: SPACING.xs },
  signatureLabel: { fontSize: FONT.sizes.xs, color: '#555' },
  footer:         { gap: SPACING.sm, padding: SPACING.md, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border },
  footerBtnRow:   { flexDirection: 'row', gap: SPACING.sm },
  footerBtn:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, paddingVertical: 12, borderRadius: RADIUS.lg },
  saveBtn:        { borderWidth: 1.5, borderColor: COLORS.primary },
  saveBtnText:    { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.primary },
  sendBtn:        { flex: 1, backgroundColor: COLORS.primary },
  sendBtnText:    { fontSize: FONT.sizes.sm, fontWeight: '700', color: '#fff' },
  approveBtn:     { flex: 1, backgroundColor: COLORS.success },
  approveBtnText: { fontSize: FONT.sizes.sm, fontWeight: '700', color: '#fff' },
  rejectBtn:      { flex: 1, borderWidth: 1.5, borderColor: COLORS.danger },
  rejectBtnText:  { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.danger },
  waitingBtn:     { flex: 1, backgroundColor: COLORS.warningLight, borderWidth: 1.5, borderColor: COLORS.warning },
  waitingBtnText: { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.warning },
  shareRow:       { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  whatsappBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: '#25D366', borderRadius: RADIUS.lg, paddingVertical: SPACING.sm },
  whatsappBtnText:{ fontSize: FONT.sizes.sm, fontWeight: '700', color: '#fff' },
  pdfBtn:         { width: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: RADIUS.lg },
});
