import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Input }           from '../../components/common/Input';
import { Button }          from '../../components/common/Button';
import { SelectDropdown, DropdownSection } from '../../components/common/SelectDropdown';
import { vehicleApi }      from '../../api/vehicleApi';
import { vehicleMasterApi } from '../../api/vehicleMasterApi';
import { VEHICLE_BRANDS, POPULAR_BRANDS, getModelsForBrand } from '../../constants/vehicleMaster';
import { showToast }       from '../../utils/toast';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'] as const;
type FuelType = (typeof FUEL_TYPES)[number];

export const AddVehicleScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { customerId, registrationHint } = route.params ?? {};

  const [regNumber,  setRegNumber]  = useState(registrationHint ?? '');
  const [brand,      setBrand]      = useState('');
  const [model,      setModel]      = useState('');
  const [year,       setYear]       = useState('');
  const [color,      setColor]      = useState('');
  const [fuelType,   setFuelType]   = useState<FuelType>('Petrol');
  const [currentKM,  setCurrentKM]  = useState('');
  const [saving,     setSaving]     = useState(false);

  // Brand dropdown state
  const [brandSections,  setBrandSections]  = useState<DropdownSection[]>([]);
  const [brandsLoading,  setBrandsLoading]  = useState(false);

  // Model dropdown state
  const [modelOptions,   setModelOptions]   = useState<string[]>([]);
  const [modelsLoading,  setModelsLoading]  = useState(false);

  // ── Load brand list on mount ──────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    setBrandsLoading(true);

    // Show local data immediately, then try to refresh from API
    const localBrands = VEHICLE_BRANDS.map(b => b.name);
    const popular     = POPULAR_BRANDS;
    const all         = localBrands;

    setBrandSections([
      { title: 'Popular Brands', data: popular },
      { title: 'All Brands',     data: all     },
    ]);
    setBrandsLoading(false);

    vehicleMasterApi.getBrands().then(apiBrands => {
      if (!mounted || apiBrands.length === 0) return;
      // If API returned brands, replace All Brands section
      setBrandSections([
        { title: 'Popular Brands', data: popular },
        { title: 'All Brands',     data: apiBrands },
      ]);
    }).catch(() => { /* keep local */ });

    return () => { mounted = false; };
  }, []);

  // ── Load model list when brand changes ───────────────────────────────────
  useEffect(() => {
    if (!brand) { setModelOptions([]); setModel(''); return; }

    setModel('');
    setModelsLoading(true);

    // Show local models immediately
    const localModels = getModelsForBrand(brand);
    setModelOptions(localModels);
    setModelsLoading(false);

    vehicleMasterApi.getModels(brand).then(apiModels => {
      if (apiModels.length > 0) setModelOptions(apiModels);
    }).catch(() => { /* keep local */ });
  }, [brand]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!regNumber.trim() || !brand.trim() || !model.trim()) {
      showToast('Registration number, brand and model are required', 'error');
      return;
    }

    setSaving(true);
    try {
      await vehicleApi.addVehicle({
        registrationNumber: regNumber.trim().toUpperCase(),
        brand:     brand.trim(),
        model:     model.trim(),
        year:      year.trim()      || undefined,
        color:     color.trim()     || undefined,
        currentKM: currentKM.trim() || undefined,
        fuleType:  fuelType,
        customerId: customerId ?? undefined,
      });
      showToast('Vehicle added successfully', 'success');
      navigation.goBack();
    } catch (e: any) {
      showToast(e.message ?? 'Failed to add vehicle', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <Input
            label="Registration Number *"
            value={regNumber}
            onChangeText={setRegNumber}
            placeholder="GJ01AH0101"
            leftIcon="barcode-outline"
            autoCapitalize="characters"
          />

          {/* ── Brand Dropdown ── */}
          <SelectDropdown
            label="Brand *"
            value={brand}
            placeholder="Select vehicle brand"
            sections={brandSections}
            loading={brandsLoading}
            leftIcon="car-outline"
            onSelect={val => setBrand(val)}
            searchPlaceholder="Search brand…"
          />

          {/* ── Model Dropdown (disabled until brand selected) ── */}
          <SelectDropdown
            label="Model *"
            value={model}
            placeholder={brand ? 'Select model' : 'Select brand first'}
            options={modelOptions}
            loading={modelsLoading}
            disabled={!brand}
            leftIcon="car-sport-outline"
            onSelect={val => setModel(val)}
            searchPlaceholder="Search model…"
          />

          <Input
            label="Year"
            value={year}
            onChangeText={setYear}
            placeholder="e.g. 2022"
            leftIcon="calendar-outline"
            keyboardType="numeric"
            maxLength={4}
          />
          <Input
            label="Color"
            value={color}
            onChangeText={setColor}
            placeholder="e.g. White"
            leftIcon="color-palette-outline"
          />
          <Input
            label="Current KM"
            value={currentKM}
            onChangeText={setCurrentKM}
            placeholder="e.g. 45000"
            leftIcon="speedometer-outline"
            keyboardType="numeric"
          />

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
        <Button title="Cancel"      onPress={() => navigation.goBack()} variant="outline" style={s.footerBtn} />
        <Button title="Add Vehicle" onPress={handleSave} loading={saving}              style={s.footerBtn} />
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.background },
  content:    { padding: SPACING.md, paddingBottom: 100 },
  card:       { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOW.sm },
  fieldLabel: { fontSize: FONT.sizes.sm, fontWeight: '500', color: COLORS.text, marginBottom: SPACING.xs },
  fuelGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.sm },
  fuelChip:       { paddingHorizontal: SPACING.sm, paddingVertical: 7, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.border },
  fuelChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  fuelText:       { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.textSecondary },
  fuelTextActive: { color: '#fff' },
  footer:     { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerBtn:  { flex: 1 },
});
