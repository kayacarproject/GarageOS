import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { FuelType } from '../../types';
import { vehicleService } from '../../services/vehicleService';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

const FUEL_TYPES: FuelType[] = ['petrol', 'diesel', 'cng', 'electric', 'hybrid'];

export const AddVehicleScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { customerId } = route.params ?? {};
  const [regNumber, setRegNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('petrol');
  const [currentKms, setCurrentKms] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!regNumber || !brand || !model) {
      Alert.alert('Required fields missing', 'Registration number, brand and model are required');
      return;
    }
    setSaving(true);
    try {
      await vehicleService.create({
        customer_id: customerId,
        registration_number: regNumber.trim().toUpperCase(),
        brand: brand.trim(),
        model: model.trim(),
        year: year ? parseInt(year, 10) : undefined,
        color: color.trim() || undefined,
        fuel_type: fuelType,
        current_kms: currentKms ? parseInt(currentKms, 10) : undefined,
      });
      Alert.alert('Vehicle Added', 'Vehicle has been registered.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to add vehicle');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <Input label="Registration Number *" value={regNumber} onChangeText={setRegNumber} placeholder="KA01AB1234" leftIcon="barcode-outline" autoCapitalize="characters" />
          <Input label="Brand *" value={brand} onChangeText={setBrand} placeholder="e.g. Maruti, Hyundai" leftIcon="car-outline" />
          <Input label="Model *" value={model} onChangeText={setModel} placeholder="e.g. Swift, Creta" leftIcon="car-sport-outline" />
          <Input label="Year" value={year} onChangeText={setYear} placeholder="e.g. 2022" leftIcon="calendar-outline" keyboardType="numeric" maxLength={4} />
          <Input label="Color" value={color} onChangeText={setColor} placeholder="e.g. White" leftIcon="color-palette-outline" />
          <Input label="Current KMs" value={currentKms} onChangeText={setCurrentKms} placeholder="e.g. 45000" leftIcon="speedometer-outline" keyboardType="numeric" />

          <Text style={s.fieldLabel}>Fuel Type</Text>
          <View style={s.fuelGrid}>
            {FUEL_TYPES.map(ft => (
              <TouchableOpacity
                key={ft}
                style={[s.fuelChip, fuelType === ft && s.fuelChipActive]}
                onPress={() => setFuelType(ft)}
              >
                <Text style={[s.fuelText, fuelType === ft && s.fuelTextActive]}>{ft}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={s.footer}>
        <Button title="Cancel" onPress={() => navigation.goBack()} variant="outline" style={s.footerBtn} />
        <Button title="Add Vehicle" onPress={handleSave} loading={saving} style={s.footerBtn} />
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingBottom: 100 },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOW.sm },
  fieldLabel: { fontSize: FONT.sizes.sm, fontWeight: '500', color: COLORS.text, marginBottom: SPACING.xs },
  fuelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.sm },
  fuelChip: { paddingHorizontal: SPACING.sm, paddingVertical: 7, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.border },
  fuelChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  fuelText: { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'capitalize' },
  fuelTextActive: { color: '#fff' },
  footer: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerBtn: { flex: 1 },
});
