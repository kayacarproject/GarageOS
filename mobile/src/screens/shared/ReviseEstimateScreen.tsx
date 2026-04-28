import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { estimateApi, HanaEstimate, HanaEstimateItem } from '../../api/estimateApi';
import { useAuthStore } from '../../stores/authStore';
import { showToast }    from '../../utils/toast';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

export const ReviseEstimateScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const estimate: HanaEstimate = route.params?.estimate;
  const { user } = useAuthStore();

  const [items,  setItems]  = useState<HanaEstimateItem[]>(estimate?.items ?? []);
  const [notes,  setNotes]  = useState(estimate?.notes ?? '');
  const [saving, setSaving] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + (i.amount || 0), 0);
  const tax      = items.reduce((sum, i) => {
    const pct = i.gst_percent ?? 0;
    return sum + Math.round(((i.amount || 0) * pct) / 100);
  }, 0);
  const discount = estimate?.discount ?? 0;
  const total    = subtotal + tax - discount;

  // ── Item helpers ───────────────────────────────────────────────────────────

  const updateItem = (idx: number, field: keyof HanaEstimateItem, raw: string) => {
    setItems(prev => {
      const next = [...prev];
      const it   = { ...next[idx] } as any;
      if (field === 'name' || field === 'unit') {
        it[field] = raw;
      } else {
        it[field] = Number(raw) || 0;
      }
      if (field === 'quantity' || field === 'unit_price') {
        it.amount = Math.round((it.quantity || 0) * (it.unit_price || 0));
      }
      next[idx] = it;
      return next;
    });
  };

  const addItem = () => {
    setItems(prev => [
      ...prev,
      { name: '', quantity: 1, unit: 'nos', unit_price: 0, amount: 0, gst_percent: 18 },
    ]);
  };

  const removeItem = (idx: number) => {
    if (items.length === 1) {
      Alert.alert('Cannot remove', 'An estimate must have at least one item.');
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (items.some(i => !i.name.trim())) {
      Alert.alert('Validation', 'All items must have a name.');
      return;
    }
    setSaving(true);
    try {
      await estimateApi.revise(estimate._id, {
        items,
        subtotal,
        discount,
        tax,
        total,
        notes:   notes.trim() || undefined,
        version: (estimate.version ?? 1) + 1,
        createdBy: user?.id,
      });
      showToast('Estimate revised and sent for approval', 'success');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not save revision. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Reference card ── */}
        <View style={s.refCard}>
          <Ionicons name="car-outline" size={16} color={COLORS.primary} />
          <Text style={s.refText}>
            {estimate?.vehicleName ?? estimate?.registrationNumber ?? `Job: ${estimate?.jobcardId?.slice(-8)?.toUpperCase()}`}
          </Text>
          <View style={s.versionBadge}>
            <Text style={s.versionText}>v{(estimate?.version ?? 1) + 1}</Text>
          </View>
        </View>

        {/* ── Line items ── */}
        <Text style={s.sectionTitle}>Line Items</Text>

        {items.map((item, idx) => (
          <View key={idx} style={s.itemCard}>
            {/* Name row */}
            <View style={s.fieldRow}>
              <TextInput
                style={[s.input, s.inputFlex]}
                placeholder="Item / Service name"
                placeholderTextColor={COLORS.textMuted}
                value={item.name}
                onChangeText={v => updateItem(idx, 'name', v)}
              />
              <TouchableOpacity style={s.removeBtn} onPress={() => removeItem(idx)}>
                <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
              </TouchableOpacity>
            </View>

            {/* Numeric fields */}
            <View style={s.fieldRow}>
              <View style={s.labeledInput}>
                <Text style={s.inputLabel}>Qty</Text>
                <TextInput
                  style={s.input}
                  keyboardType="numeric"
                  value={item.quantity ? String(item.quantity) : ''}
                  onChangeText={v => updateItem(idx, 'quantity', v)}
                />
              </View>
              <View style={s.labeledInput}>
                <Text style={s.inputLabel}>Unit Price</Text>
                <TextInput
                  style={s.input}
                  keyboardType="numeric"
                  value={item.unit_price ? String(item.unit_price) : ''}
                  onChangeText={v => updateItem(idx, 'unit_price', v)}
                />
              </View>
              <View style={s.labeledInput}>
                <Text style={s.inputLabel}>GST %</Text>
                <TextInput
                  style={s.input}
                  keyboardType="numeric"
                  value={item.gst_percent != null ? String(item.gst_percent) : ''}
                  onChangeText={v => updateItem(idx, 'gst_percent', v)}
                />
              </View>
            </View>

            <Text style={s.itemAmount}>
              Amount: ₹{(item.amount || 0).toLocaleString('en-IN')}
            </Text>
          </View>
        ))}

        <TouchableOpacity style={s.addItemBtn} onPress={addItem}>
          <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
          <Text style={s.addItemText}>Add Item</Text>
        </TouchableOpacity>

        {/* ── Notes ── */}
        <Text style={s.sectionTitle}>Notes</Text>
        <TextInput
          style={[s.input, s.notesInput]}
          placeholder="Notes for the owner…"
          placeholderTextColor={COLORS.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* ── Totals ── */}
        <View style={s.totalCard}>
          <View style={s.totalRow}>
            <Text style={s.totalRowLabel}>Subtotal</Text>
            <Text style={s.totalRowValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalRowLabel}>GST</Text>
            <Text style={s.totalRowValue}>₹{tax.toLocaleString('en-IN')}</Text>
          </View>
          {discount > 0 && (
            <View style={s.totalRow}>
              <Text style={s.totalRowLabel}>Discount</Text>
              <Text style={[s.totalRowValue, { color: COLORS.success }]}>
                -₹{discount.toLocaleString('en-IN')}
              </Text>
            </View>
          )}
          <View style={s.totalSep} />
          <View style={s.totalRow}>
            <Text style={s.totalFinalLabel}>Total</Text>
            <Text style={s.totalFinalValue}>₹{total.toLocaleString('en-IN')}</Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Footer save button ── */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="send-outline" size={18} color="#fff" />
              <Text style={s.saveBtnText}>Submit Revision</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content:   { padding: SPACING.md, paddingBottom: 20 },

  refCard: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             SPACING.sm,
    backgroundColor: COLORS.primaryLight,
    borderRadius:    RADIUS.md,
    padding:         SPACING.sm,
    marginBottom:    SPACING.md,
  },
  refText: { flex: 1, fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.primary },
  versionBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius:    RADIUS.full,
  },
  versionText: { fontSize: FONT.sizes.xs, color: '#fff', fontWeight: '700' },

  sectionTitle: {
    fontSize:     FONT.sizes.sm,
    fontWeight:   '700',
    color:        COLORS.textSecondary,
    textTransform:'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginTop:    SPACING.sm,
  },

  itemCard: {
    backgroundColor: COLORS.surface,
    borderRadius:    RADIUS.md,
    padding:         SPACING.sm,
    marginBottom:    SPACING.sm,
    ...SHADOW.sm,
  },
  fieldRow: {
    flexDirection: 'row',
    gap:           SPACING.sm,
    marginBottom:  SPACING.xs,
    alignItems:    'center',
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius:    RADIUS.sm,
    borderWidth:     1,
    borderColor:     COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize:        FONT.sizes.sm,
    color:           COLORS.text,
  },
  inputFlex:   { flex: 1 },
  labeledInput:{ flex: 1 },
  inputLabel:  { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginBottom: 3 },
  removeBtn:   { padding: 6 },

  itemAmount: {
    fontSize:   FONT.sizes.xs,
    fontWeight: '600',
    color:      COLORS.primary,
    textAlign:  'right',
    marginTop:  2,
  },

  addItemBtn: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            SPACING.xs,
    paddingVertical: 12,
    borderRadius:   RADIUS.md,
    borderWidth:    1.5,
    borderColor:    COLORS.primary,
    borderStyle:    'dashed',
    marginBottom:   SPACING.md,
  },
  addItemText: { fontSize: FONT.sizes.sm, color: COLORS.primary, fontWeight: '600' },

  notesInput: {
    minHeight:    80,
    marginBottom: SPACING.md,
  },

  totalCard: {
    backgroundColor: COLORS.surface,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.md,
    marginBottom:    SPACING.sm,
    ...SHADOW.sm,
  },
  totalRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  totalRowLabel:  { fontSize: FONT.sizes.sm, color: COLORS.textSecondary },
  totalRowValue:  { fontSize: FONT.sizes.sm, color: COLORS.text, fontWeight: '600' },
  totalSep:       { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.xs },
  totalFinalLabel:{ fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  totalFinalValue:{ fontSize: FONT.sizes.md, fontWeight: '800', color: COLORS.primary },

  footer: {
    backgroundColor: COLORS.surface,
    padding:         SPACING.md,
    borderTopWidth:  1,
    borderTopColor:  COLORS.border,
  },
  saveBtn: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius:   RADIUS.lg,
    paddingVertical: 14,
  },
  saveBtnText: { fontSize: FONT.sizes.md, fontWeight: '700', color: '#fff' },
});
