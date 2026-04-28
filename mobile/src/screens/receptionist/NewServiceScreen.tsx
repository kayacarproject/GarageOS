import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, Image, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ImagePickerModal, PickedImage } from '../../components/common/ImagePickerModal';
import { vehicleApi, HanaVehicle } from '../../api/vehicleApi';
import { jobcardApi } from '../../api/jobcardApi';
import { serviceApi, HanaService } from '../../api/serviceApi';
import { showToast } from '../../utils/toast';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;
type WorkType = 'service' | 'repair' | 'both';

const WORK_TYPES: { key: WorkType; label: string; icon: any; desc: string; code: string }[] = [
  { key: 'service', label: 'Service',          icon: 'settings-outline',  desc: 'Routine maintenance & oil change', code: 'service'        },
  { key: 'repair',  label: 'Repair',           icon: 'construct-outline', desc: 'Fix specific issues or damage',    code: 'repair'         },
  { key: 'both',    label: 'Service + Repair', icon: 'build-outline',     desc: 'Full service with repairs',        code: 'service_repair' },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export const NewServiceScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();

  // ── Step tracker ────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>(1);

  // ── Step 1 state — vehicle search ──────────────────────────────────────────
  const [plateSearch,    setPlateSearch]    = useState('');
  const [vehicles,       setVehicles]       = useState<HanaVehicle[]>([]);
  const [loadingVehicles,setLoadingVehicles]= useState(false);
  const [selectedVehicle,setSelectedVehicle]= useState<HanaVehicle | null>(null);

  // ── Step 2 state — job details ─────────────────────────────────────────────
  const [workType,      setWorkType]      = useState<WorkType>('service');
  const [currentKM,     setCurrentKM]     = useState('');   // pre-filled on vehicle select
  const [description,   setDescription]   = useState('');
  const [photos,        setPhotos]        = useState<PickedImage[]>([]);
  const [photoModal,    setPhotoModal]    = useState(false);

  // ── Service pricing (fetched from service_master) ──────────────────────────
  const [servicePrices,   setServicePrices]   = useState<HanaService[]>([]);
  const [loadingPrices,   setLoadingPrices]   = useState(false);
  const [selectedService, setSelectedService] = useState<HanaService | null>(null);

  // ── Step 3 state — submission ───────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);

  // ── Reload vehicles whenever screen is focused (back from AddVehicle etc.) ──
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        setLoadingVehicles(true);
        try {
          const data = await vehicleApi.getVehicles();
          if (active) setVehicles(data);
        } catch {
          /* keep stale list, user can still search */
        } finally {
          if (active) setLoadingVehicles(false);
        }
      })();
      return () => { active = false; };
    }, []),
  );

  // Fetch service prices when entering step 2
  useEffect(() => {
    if (step !== 2) return;
    (async () => {
      setLoadingPrices(true);
      try {
        let prices = await serviceApi.getAll(true);
        if (prices.length === 0) {
          await serviceApi.seedDefaults();
          prices = await serviceApi.getAll(true);
        }
        setServicePrices(prices);
      } catch {
        // non-fatal — user can still continue without pricing
      } finally {
        setLoadingPrices(false);
      }
    })();
  }, [step]);

  // Sync selected service whenever work type changes or prices load
  useEffect(() => {
    const code = WORK_TYPES.find(w => w.key === workType)?.code ?? workType;
    const match = servicePrices.find(s => s.code === code) ?? null;
    setSelectedService(match);
  }, [workType, servicePrices]);

  // Match on full reg, any substring, or last digits — minimum 2 chars
  const matchedVehicles = plateSearch.trim().length >= 2
    ? vehicles.filter(v => {
        const reg = (v.registrationNumber ?? '').replace(/\s/g, '').toLowerCase();
        const q   = plateSearch.trim().replace(/\s/g, '').toLowerCase();
        return reg.includes(q);
      })
    : [];

  // Pre-fill KM from selected vehicle
  const handleSelectVehicle = (v: HanaVehicle) => {
    setSelectedVehicle(v);
    setCurrentKM(v.currentKM ?? '');
  };

  // Final submit — writes to "jobcard" module, NOT "vehicle"
  const handleSubmit = async () => {
    if (!selectedVehicle) return;
    setSubmitting(true);
    try {
      const pricing = selectedService ? serviceApi.calcPricing(selectedService) : {};
      await jobcardApi.create({
        vehicleId:          selectedVehicle._id,
        registrationNumber: selectedVehicle.registrationNumber,   // denormalized display
        brand:              selectedVehicle.brand,                 // denormalized display
        model:              selectedVehicle.model,                 // denormalized display
        workType,
        currentKM:          currentKM.trim() || undefined,
        description:        description.trim() || undefined,
        photos:             photos.map(p => p.uri),
        createdBy:          user?.id ?? undefined,
        // Pricing snapshot — frozen at creation time
        serviceName:        selectedService?.name,
        ...pricing,
      });
      showToast('Job card created successfully', 'success');
      navigation.goBack();
    } catch (e: any) {
      showToast(e.message ?? 'Failed to create job card', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 1 — Find & Select Vehicle
  // ────────────────────────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <View style={s.container}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <StepBadge current={1} total={3} />
          <Text style={s.stepTitle}>Find Vehicle</Text>
          <Text style={s.stepDesc}>Search by registration number or last digits</Text>

          <Input
            value={plateSearch}
            onChangeText={v => { setPlateSearch(v); setSelectedVehicle(null); }}
            placeholder="e.g. 1111 or GJ00AA1111"
            leftIcon="search-outline"
            autoCapitalize="characters"
            autoCorrect={false}
          />

          {loadingVehicles && (
            <View style={s.loaderRow}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={s.loaderText}>Loading vehicles…</Text>
            </View>
          )}

          {!loadingVehicles && matchedVehicles.map(v => (
            <TouchableOpacity
              key={v._id}
              style={[s.vehicleCard, selectedVehicle?._id === v._id && s.vehicleCardSelected]}
              onPress={() => handleSelectVehicle(v)}
              activeOpacity={0.8}
            >
              <View style={s.vehicleIcon}>
                <Ionicons name="car" size={20} color={COLORS.primary} />
              </View>
              <View style={s.vehicleInfo}>
                <Text style={s.vehiclePlate}>{v.registrationNumber}</Text>
                <Text style={s.vehicleName}>
                  {v.brand} {v.model}{v.year ? ` · ${v.year}` : ''}
                </Text>
                {(v.fuleType || v.color) && (
                  <Text style={s.vehicleMeta}>
                    {[v.fuleType, v.color].filter(Boolean).join(' · ')}
                  </Text>
                )}
              </View>
              {selectedVehicle?._id === v._id && (
                <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}

          {plateSearch.trim().length >= 2 && !loadingVehicles && matchedVehicles.length === 0 && (
            <TouchableOpacity
              style={s.addVehicleBtn}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('AddVehicle', { registrationHint: plateSearch.trim().toUpperCase() })
              }
            >
              <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
              <Text style={s.addVehicleText}>Vehicle not found — Add new vehicle</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <View style={s.footer}>
          <Button
            title="Next: Job Details →"
            onPress={() => setStep(2)}
            disabled={!selectedVehicle}
            fullWidth
            size="lg"
          />
        </View>
      </View>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 2 — Job Details  (saved in jobcard, NOT in vehicle)
  // ────────────────────────────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <View style={s.container}>
        <ScrollView contentContainerStyle={s.content}>
          <StepBadge current={2} total={3} />
          <Text style={s.stepTitle}>Job Details</Text>

          {/* Selected vehicle summary — read-only context */}
          <View style={s.vehicleSummary}>
            <Ionicons name="car" size={18} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={s.vehicleSummaryPlate}>{selectedVehicle?.registrationNumber}</Text>
              <Text style={s.vehicleSummaryName}>
                {selectedVehicle?.brand} {selectedVehicle?.model}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setStep(1)}>
              <Text style={s.changeVehicle}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* Work Type */}
          <Text style={s.fieldLabel}>Work Type</Text>
          {WORK_TYPES.map(wt => (
            <TouchableOpacity
              key={wt.key}
              style={[s.workTypeCard, workType === wt.key && s.workTypeSelected]}
              onPress={() => setWorkType(wt.key)}
              activeOpacity={0.8}
            >
              <View style={[s.workTypeIcon, workType === wt.key && s.workTypeIconSelected]}>
                <Ionicons name={wt.icon} size={20} color={workType === wt.key ? '#fff' : COLORS.primary} />
              </View>
              <View style={s.workTypeInfo}>
                <Text style={[s.workTypeLabel, workType === wt.key && s.workTypeLabelSelected]}>
                  {wt.label}
                </Text>
                <Text style={s.workTypeDesc}>{wt.desc}</Text>
              </View>
              <View style={[s.radio, workType === wt.key && s.radioActive]}>
                {workType === wt.key && <View style={s.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}

          {/* ── Service Pricing Card ── */}
          {loadingPrices ? (
            <View style={s.pricingLoader}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={s.pricingLoaderText}>Fetching prices…</Text>
            </View>
          ) : selectedService ? (
            (() => {
              const { basePrice, taxPercent, taxAmount, estimatedTotal } = serviceApi.calcPricing(selectedService);
              return (
                <View style={s.pricingCard}>
                  <View style={s.pricingHeader}>
                    <Ionicons name="pricetag-outline" size={16} color={COLORS.primary} />
                    <Text style={s.pricingTitle}>Estimated Pricing</Text>
                  </View>
                  <View style={s.pricingRow}>
                    <Text style={s.pricingLabel}>Base Price</Text>
                    <Text style={s.pricingValue}>₹{basePrice.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={s.pricingRow}>
                    <Text style={s.pricingLabel}>Tax ({taxPercent}%)</Text>
                    <Text style={s.pricingValue}>₹{taxAmount.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={s.pricingDivider} />
                  <View style={s.pricingRow}>
                    <Text style={s.pricingTotalLabel}>Estimated Total</Text>
                    <Text style={s.pricingTotalValue}>₹{estimatedTotal.toLocaleString('en-IN')}</Text>
                  </View>
                  <Text style={s.pricingNote}>Price snapshot saved with job card</Text>
                </View>
              );
            })()
          ) : servicePrices.length > 0 ? (
            <View style={s.pricingMissing}>
              <Ionicons name="information-circle-outline" size={15} color={COLORS.warning} />
              <Text style={s.pricingMissingText}>No price set for this work type</Text>
            </View>
          ) : null}

          {/* Current KM — pre-filled from vehicle, user can update */}
          <Input
            label="Current KM (odometer reading)"
            value={currentKM}
            onChangeText={setCurrentKM}
            placeholder={selectedVehicle?.currentKM ?? 'Enter current KM'}
            leftIcon="speedometer-outline"
            keyboardType="numeric"
          />

          {/* Vehicle Photos — stored in jobcard, not vehicle */}
          <Text style={s.fieldLabel}>
            Vehicle Photos{' '}
            <Text style={s.fieldHint}>(stored in this job, not on vehicle)</Text>
          </Text>
          <TouchableOpacity
            style={s.photoBtn}
            onPress={() => setPhotoModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="camera-outline" size={20} color={COLORS.primary} />
            <Text style={s.photoBtnText}>
              {photos.length === 0
                ? 'Add Photos (before / damage / delivery)'
                : `${photos.length} photo${photos.length > 1 ? 's' : ''} added`}
            </Text>
            {photos.length > 0 && (
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
            )}
          </TouchableOpacity>
          {photos.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.thumbRow}>
              {photos.map((img, i) => (
                <Image key={i} source={{ uri: img.uri }} style={s.thumb} />
              ))}
            </ScrollView>
          )}
          <ImagePickerModal
            visible={photoModal}
            onClose={() => setPhotoModal(false)}
            images={photos}
            onImagesChange={setPhotos}
            title="Job Photos"
          />

          {/* Description */}
          <Text style={s.fieldLabel}>Description</Text>
          <TextInput
            style={s.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. Engine noise, oil leakage, full service required…"
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </ScrollView>

        <View style={s.footerRow}>
          <Button title="← Back" onPress={() => setStep(1)} variant="outline" style={s.backBtn} />
          <Button title="Review →"  onPress={() => setStep(3)} style={s.nextBtn} />
        </View>
      </View>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 3 — Review & Submit
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        <StepBadge current={3} total={3} />
        <Text style={s.stepTitle}>Review & Submit</Text>

        {/* Vehicle block */}
        <SectionCard title="Vehicle" icon="car-outline">
          <ReviewRow label="Plate"  value={selectedVehicle?.registrationNumber ?? '—'} />
          <ReviewRow label="Vehicle" value={`${selectedVehicle?.brand ?? ''} ${selectedVehicle?.model ?? ''}`} />
          {selectedVehicle?.year  && <ReviewRow label="Year"  value={selectedVehicle.year} />}
          {selectedVehicle?.color && <ReviewRow label="Color" value={selectedVehicle.color} />}
        </SectionCard>

        {/* Job details block — this is what gets saved to jobcard module */}
        <SectionCard title="Job Details" icon="construct-outline">
          <ReviewRow label="Work Type"  value={WORK_TYPES.find(w => w.key === workType)?.label ?? workType} />
          <ReviewRow label="Current KM" value={currentKM || selectedVehicle?.currentKM || '—'} />
          <ReviewRow label="Photos"     value={photos.length > 0 ? `${photos.length} photo(s)` : 'None'} />
          {description ? <ReviewRow label="Notes" value={description} /> : null}
        </SectionCard>

        {/* Pricing snapshot block */}
        {selectedService && (() => {
          const { basePrice, taxPercent, taxAmount, estimatedTotal } = serviceApi.calcPricing(selectedService);
          return (
            <SectionCard title="Pricing Snapshot" icon="pricetag-outline">
              <ReviewRow label="Service"   value={selectedService.name} />
              <ReviewRow label="Base Price" value={`₹${basePrice.toLocaleString('en-IN')}`} />
              <ReviewRow label={`Tax (${taxPercent}%)`} value={`₹${taxAmount.toLocaleString('en-IN')}`} />
              <ReviewRow label="Est. Total" value={`₹${estimatedTotal.toLocaleString('en-IN')}`} />
            </SectionCard>
          );
        })()}

        <View style={s.savingNote}>
          <Ionicons name="information-circle-outline" size={15} color={COLORS.primary} />
          <Text style={s.savingNoteText}>
            Job card will be saved separately. Vehicle record stays unchanged.
          </Text>
        </View>
      </ScrollView>

      <View style={s.footerRow}>
        <Button title="← Back"       onPress={() => setStep(2)} variant="outline" style={s.backBtn} />
        <Button title="Create Job Card" onPress={handleSubmit} loading={submitting} style={s.nextBtn} />
      </View>
    </View>
  );
};

// ─── Shared sub-components ────────────────────────────────────────────────────

const StepBadge: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <View style={s.stepBadgeRow}>
    {Array.from({ length: total }, (_, i) => (
      <View
        key={i}
        style={[s.stepDot, i + 1 === current && s.stepDotActive, i + 1 < current && s.stepDotDone]}
      />
    ))}
    <Text style={s.stepBadgeLabel}>Step {current} of {total}</Text>
  </View>
);

const SectionCard: React.FC<{ title: string; icon: any; children: React.ReactNode }> = ({
  title, icon, children,
}) => (
  <View style={s.sectionCard}>
    <View style={s.sectionCardHeader}>
      <Ionicons name={icon} size={15} color={COLORS.primary} />
      <Text style={s.sectionCardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const ReviewRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={s.reviewRow}>
    <Text style={s.reviewLabel}>{label}</Text>
    <Text style={s.reviewValue} numberOfLines={2}>{value}</Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content:   { padding: SPACING.md, paddingBottom: 110 },

  // Step badge
  stepBadgeRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.sm },
  stepDot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  stepDotActive:  { backgroundColor: COLORS.primary, width: 20, borderRadius: 4 },
  stepDotDone:    { backgroundColor: COLORS.success },
  stepBadgeLabel: { fontSize: FONT.sizes.xs, color: COLORS.textMuted, fontWeight: '600', marginLeft: 4 },

  stepTitle: { fontSize: FONT.sizes.xl, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  stepDesc:  { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.md },

  // Loader
  loaderRow:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingVertical: SPACING.sm },
  loaderText: { fontSize: FONT.sizes.sm, color: COLORS.textMuted },

  // Step 1 — vehicle cards
  vehicleCard:         { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm, borderWidth: 2, borderColor: 'transparent', gap: SPACING.sm },
  vehicleCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight + '30' },
  vehicleIcon:         { width: 40, height: 40, borderRadius: 10, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  vehicleInfo:         { flex: 1 },
  vehiclePlate:        { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  vehicleName:         { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  vehicleMeta:         { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  addVehicleBtn:       { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.primary, borderStyle: 'dashed', marginTop: SPACING.xs },
  addVehicleText:      { fontSize: FONT.sizes.sm, color: COLORS.primary, fontWeight: '600' },

  // Step 2 — vehicle summary strip
  vehicleSummary:      { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.primaryLight + '50', borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.md },
  vehicleSummaryPlate: { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.text },
  vehicleSummaryName:  { fontSize: FONT.sizes.xs, color: COLORS.textSecondary },
  changeVehicle:       { fontSize: FONT.sizes.xs, color: COLORS.primary, fontWeight: '700' },

  // Step 2 — work type
  fieldLabel:           { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs, marginTop: SPACING.sm },
  fieldHint:            { fontSize: FONT.sizes.xs, fontWeight: '400', color: COLORS.textMuted },
  workTypeCard:         { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm, borderWidth: 2, borderColor: 'transparent', gap: SPACING.sm },
  workTypeSelected:     { borderColor: COLORS.primary },
  workTypeIcon:         { width: 40, height: 40, borderRadius: 10, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  workTypeIconSelected: { backgroundColor: COLORS.primary },
  workTypeInfo:         { flex: 1 },
  workTypeLabel:        { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.text },
  workTypeLabelSelected:{ color: COLORS.primary },
  workTypeDesc:         { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  radio:                { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  radioActive:          { borderColor: COLORS.primary },
  radioDot:             { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },

  // Step 2 — photos
  photoBtn:      { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1.5, borderColor: COLORS.primary, borderStyle: 'dashed', marginBottom: SPACING.sm },
  photoBtnText:  { flex: 1, fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.primary },
  thumbRow:      { marginBottom: SPACING.sm },
  thumb:         { width: 64, height: 64, borderRadius: RADIUS.md, marginRight: SPACING.sm, backgroundColor: COLORS.border },
  textArea:      { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.sm, fontSize: FONT.sizes.sm, color: COLORS.text, minHeight: 80, borderWidth: 1.5, borderColor: COLORS.border, marginBottom: SPACING.sm },

  // Step 3 — review
  sectionCard:       { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOW.sm, marginBottom: SPACING.sm },
  sectionCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.sm, paddingBottom: SPACING.xs, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  sectionCardTitle:  { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.primary },
  reviewRow:         { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 5 },
  reviewLabel:       { width: 90, fontSize: FONT.sizes.sm, color: COLORS.textSecondary },
  reviewValue:       { flex: 1, fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.text },
  savingNote:        { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: COLORS.primaryLight + '60', borderRadius: RADIUS.md, padding: SPACING.sm, marginTop: SPACING.xs },
  savingNoteText:    { flex: 1, fontSize: FONT.sizes.xs, color: COLORS.primary },

  // Pricing card (step 2)
  pricingLoader:      { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, padding: SPACING.sm, marginBottom: SPACING.sm },
  pricingLoaderText:  { fontSize: FONT.sizes.xs, color: COLORS.textMuted },
  pricingCard:        { backgroundColor: COLORS.primaryLight + '50', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1.5, borderColor: COLORS.primary + '40' },
  pricingHeader:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.sm },
  pricingTitle:       { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.primary },
  pricingRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3 },
  pricingLabel:       { fontSize: FONT.sizes.sm, color: COLORS.textSecondary },
  pricingValue:       { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.text },
  pricingDivider:     { height: 1, backgroundColor: COLORS.primary + '30', marginVertical: 6 },
  pricingTotalLabel:  { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  pricingTotalValue:  { fontSize: FONT.sizes.lg, fontWeight: '800', color: COLORS.primary },
  pricingNote:        { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 6, fontStyle: 'italic' },
  pricingMissing:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.warningLight, borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.sm },
  pricingMissingText: { fontSize: FONT.sizes.xs, color: COLORS.warning, fontWeight: '600' },

  // Footer
  footer:    { padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerRow: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  backBtn:   { flex: 1 },
  nextBtn:   { flex: 2 },
});
