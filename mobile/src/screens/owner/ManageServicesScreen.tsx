import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, TextInput, Alert, Modal,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { serviceApi, HanaService, CreateServicePayload } from '../../api/serviceApi';
import { showToast } from '../../utils/toast';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

// ─── Form Modal ───────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  code: string;
  price: string;
  taxPercent: string;
  description: string;
  active: boolean;
}

const BLANK_FORM: FormState = { name: '', code: '', price: '', taxPercent: '18', description: '', active: true };

const ServiceFormModal: React.FC<{
  visible: boolean;
  editing: HanaService | null;
  onClose: () => void;
  onSave: (payload: CreateServicePayload, id?: string) => Promise<void>;
}> = ({ visible, editing, onClose, onSave }) => {
  const [form, setForm]     = useState<FormState>(BLANK_FORM);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setForm(editing ? {
        name:        editing.name,
        code:        editing.code,
        price:       String(editing.price),
        taxPercent:  String(editing.taxPercent),
        description: editing.description ?? '',
        active:      editing.active,
      } : BLANK_FORM);
    }
  }, [visible, editing]);

  const f = (key: keyof FormState, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Validation', 'Service name is required.'); return; }
    if (!form.code.trim()) { Alert.alert('Validation', 'Code is required (e.g. service, repair).'); return; }
    const price = parseFloat(form.price);
    const tax   = parseFloat(form.taxPercent);
    if (isNaN(price) || price < 0) { Alert.alert('Validation', 'Enter a valid price.'); return; }
    if (isNaN(tax) || tax < 0 || tax > 100) { Alert.alert('Validation', 'Tax percent must be 0–100.'); return; }

    setSaving(true);
    try {
      await onSave({
        name:        form.name.trim(),
        code:        form.code.trim().toLowerCase().replace(/\s+/g, '_'),
        price,
        taxPercent:  tax,
        description: form.description.trim() || undefined,
        active:      form.active,
      } as CreateServicePayload, editing?._id);
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={m.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={m.header}>
          <Text style={m.headerTitle}>{editing ? 'Edit Service' : 'Add Service'}</Text>
          <TouchableOpacity onPress={onClose} style={m.closeBtn}>
            <Ionicons name="close" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <ScrollView style={m.body} contentContainerStyle={{ gap: SPACING.sm }} keyboardShouldPersistTaps="handled">

          <Field label="Service Name *">
            <TextInput style={m.input} value={form.name} onChangeText={v => f('name', v)}
              placeholder="e.g. Full Service" placeholderTextColor={COLORS.textMuted} autoCapitalize="words" />
          </Field>

          <Field label="Code *" hint="Unique identifier, no spaces (e.g. service, repair, service_repair)">
            <TextInput style={m.input} value={form.code} onChangeText={v => f('code', v)}
              placeholder="e.g. service_repair" placeholderTextColor={COLORS.textMuted} autoCapitalize="none" />
          </Field>

          <View style={m.row}>
            <View style={m.rowField}>
              <Field label="Base Price (₹) *">
                <TextInput style={m.input} value={form.price} onChangeText={v => f('price', v)}
                  placeholder="1500" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" />
              </Field>
            </View>
            <View style={m.rowField}>
              <Field label="Tax %">
                <TextInput style={m.input} value={form.taxPercent} onChangeText={v => f('taxPercent', v)}
                  placeholder="18" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" />
              </Field>
            </View>
          </View>

          {/* Live price preview */}
          {parseFloat(form.price) > 0 && (
            <View style={m.preview}>
              <Text style={m.previewLabel}>Preview</Text>
              <Text style={m.previewText}>
                Base ₹{parseFloat(form.price).toLocaleString('en-IN')} +
                Tax ₹{Math.round((parseFloat(form.price) * (parseFloat(form.taxPercent) || 0)) / 100).toLocaleString('en-IN')} =
                <Text style={m.previewTotal}> ₹{(parseFloat(form.price) + Math.round((parseFloat(form.price) * (parseFloat(form.taxPercent) || 0)) / 100)).toLocaleString('en-IN')}</Text>
              </Text>
            </View>
          )}

          <Field label="Description">
            <TextInput style={[m.input, m.textArea]} value={form.description} onChangeText={v => f('description', v)}
              placeholder="Optional description" placeholderTextColor={COLORS.textMuted}
              multiline numberOfLines={2} textAlignVertical="top" />
          </Field>

          {/* Active toggle */}
          <TouchableOpacity style={[m.toggle, form.active && m.toggleActive]} onPress={() => f('active', !form.active)} activeOpacity={0.8}>
            <Ionicons name={form.active ? 'checkmark-circle' : 'close-circle-outline'} size={20} color={form.active ? COLORS.success : COLORS.textMuted} />
            <Text style={[m.toggleText, { color: form.active ? COLORS.success : COLORS.textMuted }]}>
              {form.active ? 'Active — visible during job creation' : 'Inactive — hidden from job creation'}
            </Text>
          </TouchableOpacity>

        </ScrollView>
        <View style={m.footer}>
          <TouchableOpacity style={m.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
            <Text style={m.saveBtnText}>{saving ? 'Saving…' : editing ? 'Update Service' : 'Add Service'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <View style={m.field}>
    <Text style={m.fieldLabel}>{label}</Text>
    {hint && <Text style={m.fieldHint}>{hint}</Text>}
    {children}
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export const ManageServicesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [services, setServices] = useState<HanaService[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState<HanaService | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let list = await serviceApi.getAll();
      if (list.length === 0) {
        await serviceApi.seedDefaults();
        list = await serviceApi.getAll();
      }
      setServices(list);
    } catch (e: any) {
      showToast(e.message ?? 'Failed to load services', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async (payload: CreateServicePayload, id?: string) => {
    if (id) {
      await serviceApi.update(id, payload);
      showToast('Service updated', 'success');
      setServices(prev => prev.map(s => s._id === id ? { ...s, ...payload } : s));
    } else {
      const created = await serviceApi.create(payload);
      showToast('Service added', 'success');
      setServices(prev => [...prev, created]);
    }
  };

  const handleToggle = (s: HanaService) => {
    const id = s._id;
    Alert.alert(
      s.active ? 'Deactivate Service' : 'Activate Service',
      s.active
        ? `Hide "${s.name}" from job creation?`
        : `Show "${s.name}" in job creation?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: s.active ? 'Deactivate' : 'Activate',
          onPress: async () => {
            setActionId(id);
            try {
              await serviceApi.update(id, { active: !s.active });
              setServices(prev => prev.map(x => x._id === id ? { ...x, active: !s.active } : x));
              showToast(`${s.name} ${s.active ? 'deactivated' : 'activated'}`, 'success');
            } catch (e: any) {
              showToast(e.message ?? 'Failed', 'error');
            } finally {
              setActionId(null);
            }
          },
        },
      ],
    );
  };

  const handleDelete = (s: HanaService) => {
    Alert.alert(
      'Delete Service',
      `Delete "${s.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActionId(s._id);
            try {
              await serviceApi.delete(s._id);
              setServices(prev => prev.filter(x => x._id !== s._id));
              showToast(`${s.name} deleted`, 'success');
            } catch (e: any) {
              showToast(e.message ?? 'Failed to delete', 'error');
            } finally {
              setActionId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={s.container}>
      <FlatList
        data={services}
        keyExtractor={item => item._id}
        contentContainerStyle={s.list}
        refreshing={loading}
        onRefresh={load}
        ListEmptyComponent={
          !loading ? (
            <View style={s.empty}>
              <Ionicons name="pricetag-outline" size={48} color={COLORS.textMuted} />
              <Text style={s.emptyTitle}>No services yet</Text>
              <Text style={s.emptySub}>Tap + to add your first service price</Text>
            </View>
          ) : null
        }
        renderItem={({ item: svc }) => {
          const { basePrice, taxPercent, taxAmount, estimatedTotal } = serviceApi.calcPricing(svc);
          const busy = actionId === svc._id;
          return (
            <View style={[s.card, !svc.active && s.cardInactive]}>
              <View style={s.cardTop}>
                <View style={s.cardLeft}>
                  <View style={s.codeTag}>
                    <Text style={s.codeText}>{svc.code}</Text>
                  </View>
                  <Text style={s.svcName}>{svc.name}</Text>
                  {svc.description ? <Text style={s.svcDesc}>{svc.description}</Text> : null}
                </View>
                <View style={s.priceBlock}>
                  <Text style={s.priceLabel}>Est. Total</Text>
                  <Text style={s.priceValue}>₹{estimatedTotal.toLocaleString('en-IN')}</Text>
                  <Text style={s.priceBreak}>
                    ₹{basePrice.toLocaleString('en-IN')} + {taxPercent}% tax
                  </Text>
                </View>
              </View>

              <View style={s.cardActions}>
                {/* Edit */}
                <TouchableOpacity
                  style={s.actionBtn}
                  onPress={() => { setEditing(svc); setModal(true); }}
                  disabled={busy}
                  activeOpacity={0.75}
                >
                  <Ionicons name="pencil-outline" size={14} color={COLORS.primary} />
                  <Text style={[s.actionBtnText, { color: COLORS.primary }]}>Edit</Text>
                </TouchableOpacity>

                {/* Toggle active */}
                <TouchableOpacity
                  style={[s.actionBtn, svc.active ? s.deactivateBtn : s.activateBtn]}
                  onPress={() => handleToggle(svc)}
                  disabled={busy}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={svc.active ? 'eye-off-outline' : 'eye-outline'}
                    size={14}
                    color={svc.active ? COLORS.warning : COLORS.success}
                  />
                  <Text style={[s.actionBtnText, { color: svc.active ? COLORS.warning : COLORS.success }]}>
                    {svc.active ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>

                {/* Delete */}
                <TouchableOpacity
                  style={[s.actionBtn, s.deleteBtn]}
                  onPress={() => handleDelete(svc)}
                  disabled={busy}
                  activeOpacity={0.75}
                >
                  <Ionicons name="trash-outline" size={14} color={COLORS.danger} />
                  <Text style={[s.actionBtnText, { color: COLORS.danger }]}>Delete</Text>
                </TouchableOpacity>
              </View>

              {!svc.active && (
                <View style={s.inactiveBanner}>
                  <Ionicons name="eye-off-outline" size={12} color={COLORS.textMuted} />
                  <Text style={s.inactiveBannerText}>Hidden from job creation</Text>
                </View>
              )}
            </View>
          );
        }}
      />

      {/* FAB */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => { setEditing(null); setModal(true); }}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <ServiceFormModal
        visible={modal}
        editing={editing}
        onClose={() => { setModal(false); setEditing(null); }}
        onSave={handleSave}
      />
    </View>
  );
};

// ─── Modal styles ─────────────────────────────────────────────────────────────

const m = StyleSheet.create({
  flex:        { flex: 1, backgroundColor: COLORS.background },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.surface },
  headerTitle: { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  closeBtn:    { padding: 4 },
  body:        { flex: 1, padding: SPACING.md },
  footer:      { padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  saveBtn:     { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { fontSize: FONT.sizes.md, fontWeight: '700', color: '#fff' },

  field:      { gap: 4 },
  fieldLabel: { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.text },
  fieldHint:  { fontSize: FONT.sizes.xs, color: COLORS.textMuted },
  input:      { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: 11, fontSize: FONT.sizes.md, color: COLORS.text, backgroundColor: COLORS.background },
  textArea:   { minHeight: 60, paddingTop: 10 },

  row:      { flexDirection: 'row', gap: SPACING.sm },
  rowField: { flex: 1 },

  preview:      { backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.md, padding: SPACING.sm },
  previewLabel: { fontSize: FONT.sizes.xs, fontWeight: '700', color: COLORS.primary, marginBottom: 2 },
  previewText:  { fontSize: FONT.sizes.sm, color: COLORS.text },
  previewTotal: { fontWeight: '800', color: COLORS.primary },

  toggle:      { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border },
  toggleActive:{ borderColor: COLORS.success, backgroundColor: COLORS.successLight },
  toggleText:  { flex: 1, fontSize: FONT.sizes.sm, fontWeight: '600' },
});

// ─── Screen styles ────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list:      { padding: SPACING.md, paddingBottom: 100, gap: SPACING.sm },

  empty:      { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.sm },
  emptyTitle: { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  emptySub:   { fontSize: FONT.sizes.sm, color: COLORS.textMuted, textAlign: 'center' },

  card:        { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOW.sm, gap: SPACING.sm },
  cardInactive:{ opacity: 0.6 },
  cardTop:     { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  cardLeft:    { flex: 1, gap: 3 },
  codeTag:     { alignSelf: 'flex-start', backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
  codeText:    { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  svcName:     { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  svcDesc:     { fontSize: FONT.sizes.xs, color: COLORS.textMuted },

  priceBlock: { alignItems: 'flex-end', gap: 2 },
  priceLabel: { fontSize: FONT.sizes.xs, color: COLORS.textMuted, fontWeight: '600' },
  priceValue: { fontSize: FONT.sizes.lg, fontWeight: '800', color: COLORS.primary },
  priceBreak: { fontSize: FONT.sizes.xs, color: COLORS.textSecondary },

  cardActions:  { flexDirection: 'row', gap: SPACING.xs },
  actionBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 7, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border },
  activateBtn:  { borderColor: COLORS.success, backgroundColor: COLORS.successLight },
  deactivateBtn:{ borderColor: COLORS.warning, backgroundColor: COLORS.warningLight },
  deleteBtn:    { borderColor: COLORS.danger, backgroundColor: COLORS.dangerLight },
  actionBtnText:{ fontSize: FONT.sizes.xs, fontWeight: '700' },

  inactiveBanner:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  inactiveBannerText: { fontSize: FONT.sizes.xs, color: COLORS.textMuted },

  fab: { position: 'absolute', bottom: SPACING.xl, right: SPACING.lg, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOW.lg },
});
