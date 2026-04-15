import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBookingStore } from '../../stores/bookingStore';
import { useAuthStore } from '../../stores/authStore';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { dummyCustomers } from '../../dummy/customers';
import { dummyVehicles } from '../../dummy/vehicles';
import { Customer, Vehicle, ServiceTypeHint } from '../../types';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

type Step = 'customer' | 'details' | 'confirm';

const SERVICE_TYPES: { key: ServiceTypeHint; label: string; icon: any }[] = [
  { key: 'service',    label: 'Service',    icon: 'settings-outline' },
  { key: 'repair',     label: 'Repair',     icon: 'construct-outline' },
  { key: 'inspection', label: 'Inspection', icon: 'search-outline' },
  { key: 'other',      label: 'Other',      icon: 'ellipsis-horizontal-outline' },
];

const TIMES = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

export const NewBookingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { create } = useBookingStore();

  const [step, setStep] = useState<Step>('customer');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [serviceType, setServiceType] = useState<ServiceTypeHint>('service');
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const filteredCustomers = customerSearch.length >= 2
    ? dummyCustomers.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        (c.mobile ?? '').includes(customerSearch)
      )
    : [];

  const customerVehicles = selectedCustomer
    ? dummyVehicles.filter(v => v.customer_id === selectedCustomer.id || v.customerId === selectedCustomer.id)
    : [];

  const handleConfirm = async () => {
    if (!selectedCustomer) return;
    setSaving(true);
    try {
      await create({
        customer_id: selectedCustomer.id,
        vehicle_id: selectedVehicle?.id,
        scheduled_date: today,
        scheduled_time: selectedTime,
        service_type_hint: serviceType,
        notes: notes || undefined,
        status: 'confirmed',
        created_by: user?.id ?? 'u4',
      });
      Alert.alert('Booking Confirmed!', `${selectedCustomer.name} booked for ${selectedTime}`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setSaving(false);
    }
  };

  // ── Step 1: Customer ──────────────────────────────────────────────────────
  if (step === 'customer') {
    return (
      <View style={s.container}>
        <ScrollView contentContainerStyle={s.content}>
          <Text style={s.stepLabel}>Step 1 of 3</Text>
          <Text style={s.stepTitle}>Find Customer</Text>

          <Input
            value={customerSearch}
            onChangeText={setCustomerSearch}
            placeholder="Search by name or mobile..."
            leftIcon="search-outline"
          />

          {filteredCustomers.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[s.customerCard, selectedCustomer?.id === c.id && s.customerCardSelected]}
              onPress={() => setSelectedCustomer(c)}
              activeOpacity={0.8}
            >
              <Avatar name={c.name} size={40} />
              <View style={s.customerInfo}>
                <Text style={s.customerName}>{c.name}</Text>
                <Text style={s.customerMobile}>{c.mobile ?? c.phone}</Text>
              </View>
              {selectedCustomer?.id === c.id && <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />}
            </TouchableOpacity>
          ))}

          {customerSearch.length >= 2 && filteredCustomers.length === 0 && (
            <TouchableOpacity style={s.addNewBtn} onPress={() => navigation.navigate('AddCustomer')}>
              <Ionicons name="person-add-outline" size={18} color={COLORS.primary} />
              <Text style={s.addNewText}>Add new customer</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
        <View style={s.footer}>
          <Button title="Next →" onPress={() => setStep('details')} disabled={!selectedCustomer} fullWidth size="lg" />
        </View>
      </View>
    );
  }

  // ── Step 2: Details ───────────────────────────────────────────────────────
  if (step === 'details') {
    return (
      <View style={s.container}>
        <ScrollView contentContainerStyle={s.content}>
          <Text style={s.stepLabel}>Step 2 of 3</Text>
          <Text style={s.stepTitle}>Booking Details</Text>

          {/* Service Type */}
          <Text style={s.fieldLabel}>Service Type</Text>
          <View style={s.serviceGrid}>
            {SERVICE_TYPES.map(st => (
              <TouchableOpacity
                key={st.key}
                style={[s.serviceCard, serviceType === st.key && s.serviceCardActive]}
                onPress={() => setServiceType(st.key)}
                activeOpacity={0.8}
              >
                <Ionicons name={st.icon} size={20} color={serviceType === st.key ? COLORS.primary : COLORS.textSecondary} />
                <Text style={[s.serviceLabel, serviceType === st.key && s.serviceLabelActive]}>{st.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Time Slots */}
          <Text style={s.fieldLabel}>Time Slot</Text>
          <View style={s.timeGrid}>
            {TIMES.map(t => (
              <TouchableOpacity
                key={t}
                style={[s.timeChip, selectedTime === t && s.timeChipActive]}
                onPress={() => setSelectedTime(t)}
              >
                <Text style={[s.timeText, selectedTime === t && s.timeTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Vehicle (optional) */}
          <Text style={s.fieldLabel}>Vehicle (optional)</Text>
          {customerVehicles.map(v => (
            <TouchableOpacity
              key={v.id}
              style={[s.vehicleChip, selectedVehicle?.id === v.id && s.vehicleChipActive]}
              onPress={() => setSelectedVehicle(selectedVehicle?.id === v.id ? null : v)}
            >
              <Ionicons name="car-outline" size={16} color={selectedVehicle?.id === v.id ? COLORS.primary : COLORS.textSecondary} />
              <Text style={[s.vehicleChipText, selectedVehicle?.id === v.id && { color: COLORS.primary }]}>
                {v.registration_number ?? v.licensePlate} · {v.brand ?? v.make} {v.model}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Notes */}
          <Text style={s.fieldLabel}>Notes</Text>
          <TextInput
            style={s.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any special instructions..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </ScrollView>
        <View style={s.footerRow}>
          <Button title="← Back" onPress={() => setStep('customer')} variant="outline" style={s.backBtn} />
          <Button title="Review →" onPress={() => setStep('confirm')} style={s.nextBtn} />
        </View>
      </View>
    );
  }

  // ── Step 3: Confirm ───────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.stepLabel}>Step 3 of 3</Text>
        <Text style={s.stepTitle}>Confirm Booking</Text>

        <View style={s.confirmCard}>
          <ConfirmRow icon="person-outline"   label="Customer" value={selectedCustomer?.name ?? ''} />
          <ConfirmRow icon="call-outline"     label="Mobile"   value={selectedCustomer?.mobile ?? selectedCustomer?.phone ?? ''} />
          <ConfirmRow icon="calendar-outline" label="Date"     value={new Date(today).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} />
          <ConfirmRow icon="time-outline"     label="Time"     value={selectedTime} />
          <ConfirmRow icon="settings-outline" label="Service"  value={serviceType} />
          {selectedVehicle && <ConfirmRow icon="car-outline" label="Vehicle" value={`${selectedVehicle.brand ?? selectedVehicle.make} ${selectedVehicle.model} · ${selectedVehicle.registration_number ?? selectedVehicle.licensePlate}`} />}
          {notes && <ConfirmRow icon="document-text-outline" label="Notes" value={notes} />}
        </View>
      </ScrollView>
      <View style={s.footerRow}>
        <Button title="← Back" onPress={() => setStep('details')} variant="outline" style={s.backBtn} />
        <Button title="Confirm Booking" onPress={handleConfirm} loading={saving} style={s.nextBtn} />
      </View>
    </View>
  );
};

const ConfirmRow: React.FC<{ icon: any; label: string; value: string }> = ({ icon, label, value }) => (
  <View style={s.confirmRow}>
    <Ionicons name={icon} size={15} color={COLORS.textSecondary} />
    <Text style={s.confirmLabel}>{label}</Text>
    <Text style={s.confirmValue}>{value}</Text>
  </View>
);

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingBottom: 100 },
  stepLabel: { fontSize: FONT.sizes.xs, color: COLORS.primary, fontWeight: '700', marginBottom: 4 },
  stepTitle: { fontSize: FONT.sizes.xl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  customerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm, borderWidth: 2, borderColor: 'transparent', gap: SPACING.sm },
  customerCardSelected: { borderColor: COLORS.primary },
  customerInfo: { flex: 1 },
  customerName: { fontSize: FONT.sizes.md, fontWeight: '600', color: COLORS.text },
  customerMobile: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary },
  addNewBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.primary, borderStyle: 'dashed' },
  addNewText: { fontSize: FONT.sizes.sm, color: COLORS.primary, fontWeight: '600' },
  fieldLabel: { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs, marginTop: SPACING.sm },
  serviceGrid: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  serviceCard: { flex: 1, alignItems: 'center', padding: SPACING.sm, borderRadius: RADIUS.lg, borderWidth: 2, borderColor: COLORS.border, gap: 4, backgroundColor: COLORS.surface },
  serviceCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  serviceLabel: { fontSize: FONT.sizes.xs, fontWeight: '600', color: COLORS.textSecondary },
  serviceLabelActive: { color: COLORS.primary },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.sm },
  timeChip: { paddingHorizontal: SPACING.sm, paddingVertical: 7, borderRadius: RADIUS.sm, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  timeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timeText: { fontSize: FONT.sizes.xs, fontWeight: '600', color: COLORS.textSecondary },
  timeTextActive: { color: '#fff' },
  vehicleChip: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, marginBottom: SPACING.xs, backgroundColor: COLORS.surface },
  vehicleChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  vehicleChipText: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary },
  notesInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.sm, fontSize: FONT.sizes.sm, color: COLORS.text, minHeight: 80, backgroundColor: COLORS.surface },
  confirmCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOW.sm, gap: SPACING.sm },
  confirmRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  confirmLabel: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, width: 70 },
  confirmValue: { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.text, flex: 1, textTransform: 'capitalize' },
  footer: { padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerRow: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  backBtn: { flex: 1 },
  nextBtn: { flex: 2 },
});
