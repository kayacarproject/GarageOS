import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useJobCardStore } from '../../stores/jobCardStore';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ImagePickerModal, PickedImage } from '../../components/common/ImagePickerModal';
import { dummyVehicles } from '../../dummy/vehicles';
import { dummyCustomers } from '../../dummy/customers';
import { Vehicle, WorkType } from '../../types';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

type Step = 'vehicle' | 'worktype' | 'confirm';

const WORK_TYPES: { key: WorkType; label: string; icon: any; desc: string }[] = [
  { key: 'service', label: 'Service',        icon: 'settings-outline',   desc: 'Routine maintenance & oil change' },
  { key: 'repair',  label: 'Repair',         icon: 'construct-outline',  desc: 'Fix specific issues or damage' },
  { key: 'both',    label: 'Service + Repair', icon: 'build-outline',    desc: 'Full service with repairs' },
];

export const NewServiceScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { create } = useJobCardStore();

  const [step, setStep] = useState<Step>('vehicle');
  const [plateSearch, setPlateSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [workType, setWorkType] = useState<WorkType>('service');
  const [description, setDescription] = useState('');
  const [currentKms, setCurrentKms] = useState('');
  const [creating, setCreating] = useState(false);
  const [images, setImages] = useState<PickedImage[]>([]);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // All roles can capture vehicle photos during check-in
  const isOwner = true;

  const matchedVehicles = plateSearch.length >= 4
    ? dummyVehicles.filter(v =>
        (v.registration_number ?? v.licensePlate ?? '').toLowerCase().includes(plateSearch.toLowerCase())
      )
    : [];

  const handleCreateJobCard = async () => {
    if (!selectedVehicle) return;
    setCreating(true);
    try {
      await create({
        vehicle_id: selectedVehicle.id,
        customer_id: selectedVehicle.customer_id ?? selectedVehicle.customerId ?? '',
        work_type: workType,
        priority: 'NORMAL',
        current_kms: parseInt(currentKms) || selectedVehicle.current_kms || 0,
        description,
      });
      Alert.alert('✅ Job Card Created', 'New job card has been created successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not create job card.');
    } finally {
      setCreating(false);
    }
  };

  // ── Step: Vehicle Lookup ──────────────────────────────────────────────────
  if (step === 'vehicle') {
    return (
      <View style={s.container}>
        <ScrollView contentContainerStyle={s.content}>
          <Text style={s.stepLabel}>Step 1 of 3</Text>
          <Text style={s.stepTitle}>Find Vehicle</Text>
          <Text style={s.stepDesc}>Search by registration number (last 4 digits)</Text>

          <Input
            value={plateSearch}
            onChangeText={setPlateSearch}
            placeholder="e.g. 1234 or KA01AB1234"
            leftIcon="search-outline"
            autoCapitalize="characters"
          />

          {matchedVehicles.map(v => {
            const customer = dummyCustomers.find(c => c.id === (v.customer_id ?? v.customerId));
            return (
              <TouchableOpacity
                key={v.id}
                style={[s.vehicleCard, selectedVehicle?.id === v.id && s.vehicleCardSelected]}
                onPress={() => setSelectedVehicle(v)}
                activeOpacity={0.8}
              >
                <View style={s.vehicleIcon}>
                  <Ionicons name="car" size={20} color={COLORS.primary} />
                </View>
                <View style={s.vehicleInfo}>
                  <Text style={s.vehiclePlate}>{v.registration_number ?? v.licensePlate}</Text>
                  <Text style={s.vehicleName}>{v.brand ?? v.make} {v.model} · {v.year}</Text>
                  {customer && <Text style={s.vehicleCustomer}>{customer.name}</Text>}
                </View>
                {selectedVehicle?.id === v.id && (
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            );
          })}

          {plateSearch.length >= 4 && matchedVehicles.length === 0 && (
            <TouchableOpacity style={s.addVehicleBtn} onPress={() => navigation.navigate('AddVehicle')}>
              <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
              <Text style={s.addVehicleText}>Vehicle not found — Add new vehicle</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
        <View style={s.footer}>
          <Button title="Next: Work Type →" onPress={() => setStep('worktype')} disabled={!selectedVehicle} fullWidth size="lg" />
        </View>
      </View>
    );
  }

  // ── Step: Work Type ───────────────────────────────────────────────────────
  if (step === 'worktype') {
    return (
      <View style={s.container}>
        <ScrollView contentContainerStyle={s.content}>
          <Text style={s.stepLabel}>Step 2 of 3</Text>
          <Text style={s.stepTitle}>Work Type</Text>

          {WORK_TYPES.map(wt => (
            <TouchableOpacity
              key={wt.key}
              style={[s.workTypeCard, workType === wt.key && s.workTypeSelected]}
              onPress={() => setWorkType(wt.key)}
              activeOpacity={0.8}
            >
              <View style={[s.workTypeIcon, workType === wt.key && s.workTypeIconSelected]}>
                <Ionicons name={wt.icon} size={22} color={workType === wt.key ? '#fff' : COLORS.primary} />
              </View>
              <View style={s.workTypeInfo}>
                <Text style={[s.workTypeLabel, workType === wt.key && s.workTypeLabelSelected]}>{wt.label}</Text>
                <Text style={s.workTypeDesc}>{wt.desc}</Text>
              </View>
              <View style={[s.radioOuter, workType === wt.key && s.radioSelected]}>
                {workType === wt.key && <View style={s.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}

          <Input
            label="Current KMs"
            value={currentKms}
            onChangeText={setCurrentKms}
            placeholder={String(selectedVehicle?.current_kms ?? '')}
            leftIcon="speedometer-outline"
            keyboardType="numeric"
          />

          {/* Image upload — owner/super_admin only */}
          {isOwner && (
            <>
              <Text style={s.fieldLabel}>Vehicle Photos</Text>
              <TouchableOpacity style={s.imagePickerBtn} onPress={() => setImageModalVisible(true)} activeOpacity={0.8}>
                <Ionicons name="camera-outline" size={20} color={COLORS.primary} />
                <Text style={s.imagePickerBtnText}>
                  {images.length === 0 ? 'Add Photos' : `${images.length} photo${images.length > 1 ? 's' : ''} added`}
                </Text>
                {images.length > 0 && <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />}
              </TouchableOpacity>

              {images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.thumbRow}>
                  {images.map((img, idx) => (
                    <Image key={idx} source={{ uri: img.uri }} style={s.thumb} />
                  ))}
                </ScrollView>
              )}

              <ImagePickerModal
                visible={imageModalVisible}
                onClose={() => setImageModalVisible(false)}
                images={images}
                onImagesChange={setImages}
                title="Vehicle Photos"
              />
            </>
          )}

          <Text style={s.fieldLabel}>Description (optional)</Text>
          <TextInput
            style={s.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the work needed..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </ScrollView>
        <View style={s.footerRow}>
          <Button title="← Back" onPress={() => setStep('vehicle')} variant="outline" style={s.backBtn} />
          <Button title="Review →" onPress={() => setStep('confirm')} style={s.nextBtn} />
        </View>
      </View>
    );
  }

  // ── Step: Confirm ─────────────────────────────────────────────────────────
  const customer = dummyCustomers.find(c => c.id === (selectedVehicle?.customer_id ?? selectedVehicle?.customerId));
  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.stepLabel}>Step 3 of 3</Text>
        <Text style={s.stepTitle}>Confirm Job Card</Text>

        <View style={s.confirmCard}>
          <Row icon="car-outline"       label="Vehicle"   value={`${selectedVehicle?.brand ?? ''} ${selectedVehicle?.model} · ${selectedVehicle?.registration_number ?? selectedVehicle?.licensePlate}`} />
          <Row icon="person-outline"    label="Customer"  value={customer?.name ?? '—'} />
          <Row icon="build-outline"     label="Work Type" value={workType.toUpperCase()} />
          <Row icon="speedometer-outline" label="KMs"     value={currentKms || String(selectedVehicle?.current_kms ?? '—')} />
          {description && <Row icon="document-text-outline" label="Notes" value={description} />}
        </View>

        {/* GPS note */}
        <View style={s.gpsNote}>
          <Ionicons name="location-outline" size={16} color={COLORS.primary} />
          <Text style={s.gpsNoteText}>GPS location will be captured automatically on creation</Text>
        </View>
      </ScrollView>
      <View style={s.footerRow}>
        <Button title="← Back" onPress={() => setStep('worktype')} variant="outline" style={s.backBtn} />
        <Button title="Create Job Card" onPress={handleCreateJobCard} loading={creating} style={s.nextBtn} />
      </View>
    </View>
  );
};

const Row: React.FC<{ icon: any; label: string; value: string }> = ({ icon, label, value }) => (
  <View style={s.confirmRow}>
    <Ionicons name={icon} size={16} color={COLORS.textSecondary} />
    <Text style={s.confirmLabel}>{label}</Text>
    <Text style={s.confirmValue} numberOfLines={2}>{value}</Text>
  </View>
);

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingBottom: 100 },
  stepLabel: { fontSize: FONT.sizes.xs, color: COLORS.primary, fontWeight: '700', marginBottom: 4 },
  stepTitle: { fontSize: FONT.sizes.xl, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  stepDesc: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.md },
  vehicleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm, borderWidth: 2, borderColor: 'transparent', gap: SPACING.sm },
  vehicleCardSelected: { borderColor: COLORS.primary },
  vehicleIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  vehicleInfo: { flex: 1 },
  vehiclePlate: { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  vehicleName: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary },
  vehicleCustomer: { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  addVehicleBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.primary, borderStyle: 'dashed' },
  addVehicleText: { fontSize: FONT.sizes.sm, color: COLORS.primary, fontWeight: '600' },
  workTypeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm, borderWidth: 2, borderColor: 'transparent', gap: SPACING.sm },
  workTypeSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  workTypeIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  workTypeIconSelected: { backgroundColor: COLORS.primary },
  workTypeInfo: { flex: 1 },
  workTypeLabel: { fontSize: FONT.sizes.md, fontWeight: '600', color: COLORS.text },
  workTypeLabelSelected: { color: COLORS.primary },
  workTypeDesc: { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: COLORS.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },
  fieldLabel: { fontSize: FONT.sizes.sm, fontWeight: '500', color: COLORS.text, marginBottom: SPACING.xs },
  textArea: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.sm, fontSize: FONT.sizes.sm, color: COLORS.text, minHeight: 80, borderWidth: 1.5, borderColor: COLORS.border },
  confirmCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOW.sm, gap: SPACING.sm },
  confirmRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  confirmLabel: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, width: 80 },
  confirmValue: { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.text, flex: 1 },
  gpsNote: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.md, padding: SPACING.sm, marginTop: SPACING.md },
  gpsNoteText: { fontSize: FONT.sizes.xs, color: COLORS.primary, flex: 1 },
  footer: { padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerRow: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  backBtn:          { flex: 1 },
  nextBtn:          { flex: 2 },
  imagePickerBtn:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1.5, borderColor: COLORS.primary, borderStyle: 'dashed', marginBottom: SPACING.sm },
  imagePickerBtnText: { flex: 1, fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.primary },
  thumbRow:         { marginBottom: SPACING.sm },
  thumb:            { width: 64, height: 64, borderRadius: RADIUS.md, marginRight: SPACING.sm, backgroundColor: COLORS.border },
});
