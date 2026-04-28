import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons }         from '@expo/vector-icons';
import { useBookingStore }  from '../../stores/bookingStore';
import { useAuthStore }     from '../../stores/authStore';
import { customerApi }      from '../../api/customerApi';
import { vehicleApi, HanaVehicle } from '../../api/vehicleApi';
import { bookingApi }       from '../../api/bookingApi';
import { Input }            from '../../components/common/Input';
import { Button }           from '../../components/common/Button';
import { Avatar }           from '../../components/common/Avatar';
import { showToast }        from '../../utils/toast';
import type { Customer, ServiceTypeHint } from '../../types';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

type Step = 'customer' | 'details' | 'confirm';

const SERVICE_TYPES: { key: ServiceTypeHint; label: string; icon: any }[] = [
  { key: 'service',    label: 'Service',    icon: 'settings-outline' },
  { key: 'repair',     label: 'Repair',     icon: 'construct-outline' },
  { key: 'inspection', label: 'Inspection', icon: 'search-outline' },
  { key: 'other',      label: 'Other',      icon: 'ellipsis-horizontal-outline' },
];

const TIMES = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
];

// ─── ConfirmRow helper ────────────────────────────────────────────────────────

const ConfirmRow: React.FC<{ icon: any; label: string; value: string }> = ({ icon, label, value }) => (
  <View style={s.confirmRow}>
    <Ionicons name={icon} size={15} color={COLORS.textSecondary} />
    <Text style={s.confirmLabel}>{label}</Text>
    <Text style={s.confirmValue}>{value}</Text>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export const NewBookingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user }   = useAuthStore();
  const { create } = useBookingStore();

  const today = new Date().toISOString().split('T')[0];

  const [step, setStep] = useState<Step>('customer');

  // ── Step 1 — Customer ────────────────────────────────────────────────────
  const [customerSearch,   setCustomerSearch]   = useState('');
  const [allCustomers,     setAllCustomers]     = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // ── Step 2 — Details ─────────────────────────────────────────────────────
  const [serviceType,     setServiceType]     = useState<ServiceTypeHint>('service');
  const [selectedTime,    setSelectedTime]    = useState('10:00');
  const [bookedSlots,     setBookedSlots]     = useState<string[]>([]);
  const [slotsLoading,    setSlotsLoading]    = useState(false);
  const [customerVehicles, setCustomerVehicles] = useState<HanaVehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<HanaVehicle | null>(null);
  const [notes,           setNotes]           = useState('');

  // ── Step 3 — Confirm ─────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);

  // Load all customers once on mount
  useEffect(() => {
    setCustomersLoading(true);
    customerApi.getAll()
      .then(setAllCustomers)
      .catch(() => showToast('Could not load customers', 'error'))
      .finally(() => setCustomersLoading(false));
  }, []);

  // Load vehicles + booked slots when entering Step 2
  useEffect(() => {
    if (step !== 'details' || !selectedCustomer) return;

    setVehiclesLoading(true);
    vehicleApi.getVehicles({ customerId: selectedCustomer.id })
      .then(data => { setCustomerVehicles(data); setSelectedVehicle(null); })
      .catch(() => setCustomerVehicles([]))
      .finally(() => setVehiclesLoading(false));

    setSlotsLoading(true);
    bookingApi.getBookedSlots(today)
      .then(setBookedSlots)
      .catch(() => setBookedSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [step]);

  const filteredCustomers = customerSearch.length >= 2
    ? allCustomers.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        (c.mobile ?? '').includes(customerSearch)
      )
    : [];

  const handleConfirm = async () => {
    if (!selectedCustomer) return;
    setSaving(true);
    try {
      await create({
        customerId:    selectedCustomer.id,
        customerName:  selectedCustomer.name,
        mobile:        selectedCustomer.mobile ?? selectedCustomer.phone ?? '',
        serviceType,
        bookingDate:   today,
        timeSlot:      selectedTime,
        vehicleId:     selectedVehicle?._id,
        vehicleNumber: selectedVehicle?.registrationNumber,
        vehicleName:   selectedVehicle
          ? [selectedVehicle.brand, selectedVehicle.model].filter(Boolean).join(' ')
          : undefined,
        notes:         notes.trim() || undefined,
        status:        'confirmed',
        createdBy:     user?.id ?? '',
      });
      showToast('Booking confirmed successfully', 'success');
      navigation.goBack();
    } catch (e: any) {
      showToast(e?.message || 'Failed to create booking', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Step 1: Find Customer ─────────────────────────────────────────────────

  if (step === 'customer') {
    return (
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <Text style={s.stepLabel}>Step 1 of 3</Text>
          <Text style={s.stepTitle}>Find Customer</Text>

          <Input
            value={customerSearch}
            onChangeText={setCustomerSearch}
            placeholder="Search by name or mobile..."
            leftIcon="search-outline"
          />

          {/* Loading state */}
          {customersLoading && (
            <View style={s.loadingRow}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={s.loadingText}>Loading customers…</Text>
            </View>
          )}

          {/* Results */}
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
              {selectedCustomer?.id === c.id && (
                <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}

          {/* No results + add new CTA */}
          {customerSearch.length >= 2 && !customersLoading && filteredCustomers.length === 0 && (
            <TouchableOpacity
              style={s.addNewBtn}
              onPress={() => navigation.navigate('AddCustomer')}
            >
              <Ionicons name="person-add-outline" size={18} color={COLORS.primary} />
              <Text style={s.addNewText}>Add new customer</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <View style={s.footer}>
          <Button
            title="Next →"
            onPress={() => setStep('details')}
            disabled={!selectedCustomer}
            fullWidth
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ── Step 2: Booking Details ───────────────────────────────────────────────

  if (step === 'details') {
    return (
      <View style={s.container}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
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
                <Ionicons
                  name={st.icon}
                  size={20}
                  color={serviceType === st.key ? COLORS.primary : COLORS.textSecondary}
                />
                <Text style={[s.serviceLabel, serviceType === st.key && s.serviceLabelActive]}>
                  {st.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Time Slots */}
          <View style={s.slotHeader}>
            <Text style={s.fieldLabel}>Time Slot</Text>
            {slotsLoading && <ActivityIndicator size="small" color={COLORS.primary} />}
          </View>
          <View style={s.timeGrid}>
            {TIMES.map(t => {
              const isBooked   = bookedSlots.includes(t);
              const isSelected = selectedTime === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[
                    s.timeChip,
                    isSelected && s.timeChipActive,
                    isBooked   && s.timeChipBooked,
                  ]}
                  onPress={() => !isBooked && setSelectedTime(t)}
                  disabled={isBooked}
                  activeOpacity={isBooked ? 1 : 0.7}
                >
                  <Text style={[
                    s.timeText,
                    isSelected && s.timeTextActive,
                    isBooked   && s.timeTextBooked,
                  ]}>
                    {t}
                  </Text>
                  {isBooked && <Text style={s.bookedLabel}>Full</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Vehicle (optional) */}
          <Text style={s.fieldLabel}>
            Vehicle (optional)
            {vehiclesLoading && ' '}
          </Text>
          {vehiclesLoading ? (
            <View style={s.loadingRow}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={s.loadingText}>Loading vehicles…</Text>
            </View>
          ) : customerVehicles.length === 0 ? (
            <Text style={s.emptyNote}>No vehicles registered for this customer</Text>
          ) : (
            customerVehicles.map(v => (
              <TouchableOpacity
                key={v._id}
                style={[s.vehicleChip, selectedVehicle?._id === v._id && s.vehicleChipActive]}
                onPress={() => setSelectedVehicle(selectedVehicle?._id === v._id ? null : v)}
              >
                <Ionicons
                  name="car-outline"
                  size={16}
                  color={selectedVehicle?._id === v._id ? COLORS.primary : COLORS.textSecondary}
                />
                <Text style={[s.vehicleChipText, selectedVehicle?._id === v._id && { color: COLORS.primary }]}>
                  {v.registrationNumber} · {[v.brand, v.model].filter(Boolean).join(' ')}
                </Text>
              </TouchableOpacity>
            ))
          )}

          {/* Notes */}
          <Text style={[s.fieldLabel, { marginTop: SPACING.sm }]}>Notes</Text>
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
          <Button title="← Back"   onPress={() => setStep('customer')} variant="outline" style={s.backBtn} />
          <Button title="Review →" onPress={() => setStep('confirm')}                    style={s.nextBtn} />
        </View>
      </View>
    );
  }

  // ── Step 3: Confirm Booking ───────────────────────────────────────────────

  const vehicleLabel = selectedVehicle
    ? `${[selectedVehicle.brand, selectedVehicle.model].filter(Boolean).join(' ')} · ${selectedVehicle.registrationNumber}`
    : '';

  const dateDisplay = new Date(today).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.stepLabel}>Step 3 of 3</Text>
        <Text style={s.stepTitle}>Confirm Booking</Text>

        <View style={s.confirmCard}>
          <ConfirmRow icon="person-outline"   label="Customer" value={selectedCustomer?.name ?? ''} />
          <ConfirmRow icon="call-outline"     label="Mobile"   value={selectedCustomer?.mobile ?? selectedCustomer?.phone ?? ''} />
          <ConfirmRow icon="calendar-outline" label="Date"     value={dateDisplay} />
          <ConfirmRow icon="time-outline"     label="Time"     value={selectedTime} />
          <ConfirmRow icon="settings-outline" label="Service"  value={serviceType} />
          {!!vehicleLabel && (
            <ConfirmRow icon="car-outline" label="Vehicle" value={vehicleLabel} />
          )}
          {!!notes.trim() && (
            <ConfirmRow icon="document-text-outline" label="Notes" value={notes.trim()} />
          )}
        </View>
      </ScrollView>

      <View style={s.footerRow}>
        <Button title="← Back"          onPress={() => setStep('details')} variant="outline" style={s.backBtn} />
        <Button title="Confirm Booking" onPress={handleConfirm} loading={saving}             style={s.nextBtn} />
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content:   { padding: SPACING.md, paddingBottom: 100 },

  stepLabel: { fontSize: FONT.sizes.xs, color: COLORS.primary, fontWeight: '700', marginBottom: 4 },
  stepTitle: { fontSize: FONT.sizes.xl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },

  // Customer step
  customerCard:         { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm, borderWidth: 2, borderColor: 'transparent', gap: SPACING.sm },
  customerCardSelected: { borderColor: COLORS.primary },
  customerInfo:         { flex: 1 },
  customerName:         { fontSize: FONT.sizes.md, fontWeight: '600', color: COLORS.text },
  customerMobile:       { fontSize: FONT.sizes.sm, color: COLORS.textSecondary },

  addNewBtn:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.primary, borderStyle: 'dashed' },
  addNewText: { fontSize: FONT.sizes.sm, color: COLORS.primary, fontWeight: '600' },

  loadingRow:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm },
  loadingText: { fontSize: FONT.sizes.sm, color: COLORS.textMuted },
  emptyNote:   { fontSize: FONT.sizes.sm, color: COLORS.textMuted, paddingVertical: SPACING.sm },

  // Details step
  fieldLabel:   { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs, marginTop: SPACING.sm },
  slotHeader:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  serviceGrid:  { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  serviceCard:  { flex: 1, alignItems: 'center', padding: SPACING.sm, borderRadius: RADIUS.lg, borderWidth: 2, borderColor: COLORS.border, gap: 4, backgroundColor: COLORS.surface },
  serviceCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  serviceLabel:       { fontSize: FONT.sizes.xs, fontWeight: '600', color: COLORS.textSecondary },
  serviceLabelActive: { color: COLORS.primary },

  timeGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.sm },
  timeChip:      { paddingHorizontal: SPACING.sm, paddingVertical: 7, borderRadius: RADIUS.sm, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface, alignItems: 'center' },
  timeChipActive:{ backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timeChipBooked:{ backgroundColor: COLORS.background, borderColor: COLORS.border, opacity: 0.5 },
  timeText:      { fontSize: FONT.sizes.xs, fontWeight: '600', color: COLORS.textSecondary },
  timeTextActive:{ color: '#fff' },
  timeTextBooked:{ color: COLORS.textMuted },
  bookedLabel:   { fontSize: 9, color: COLORS.danger, fontWeight: '700', marginTop: 1 },

  vehicleChip:       { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, marginBottom: SPACING.xs, backgroundColor: COLORS.surface },
  vehicleChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  vehicleChipText:   { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, flex: 1 },

  notesInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.sm, fontSize: FONT.sizes.sm, color: COLORS.text, minHeight: 80, backgroundColor: COLORS.surface },

  // Confirm step
  confirmCard:  { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOW.sm, gap: SPACING.sm },
  confirmRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  confirmLabel: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, width: 70 },
  confirmValue: { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.text, flex: 1, textTransform: 'capitalize' },

  // Footers
  footer:    { padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerRow: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  backBtn:   { flex: 1 },
  nextBtn:   { flex: 2 },
});
