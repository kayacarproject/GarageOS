import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';
import type { InspectionRating, InspectionType, CreateInspectionPayload } from '../../types';

// ─── Config ───────────────────────────────────────────────────────────────────

type ComponentKey = 'engine' | 'brakes' | 'clutch' | 'ac' | 'battery' | 'tyres' | 'lights' | 'steering';

const COMPONENTS: { key: ComponentKey; label: string; icon: any }[] = [
  { key: 'engine',   label: 'Engine',   icon: 'settings-outline' },
  { key: 'brakes',   label: 'Brakes',   icon: 'stop-circle-outline' },
  { key: 'clutch',   label: 'Clutch',   icon: 'disc-outline' },
  { key: 'ac',       label: 'AC',       icon: 'snow-outline' },
  { key: 'battery',  label: 'Battery',  icon: 'battery-charging-outline' },
  { key: 'tyres',    label: 'Tyres',    icon: 'ellipse-outline' },
  { key: 'lights',   label: 'Lights',   icon: 'flashlight-outline' },
  { key: 'steering', label: 'Steering', icon: 'navigate-circle-outline' },
];

const RATINGS: { key: InspectionRating; label: string; color: string; bg: string }[] = [
  { key: 'good',    label: 'Good', color: COLORS.success, bg: COLORS.successLight },
  { key: 'average', label: 'Avg',  color: COLORS.warning, bg: COLORS.warningLight },
  { key: 'poor',    label: 'Poor', color: COLORS.danger,  bg: COLORS.dangerLight },
  { key: 'na',      label: 'N/A',  color: COLORS.textMuted, bg: '#F3F4F6' },
];

type Ratings = Record<ComponentKey, InspectionRating>;

const defaultRatings = (): Ratings =>
  Object.fromEntries(COMPONENTS.map(c => [c.key, 'good'])) as Ratings;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface InspectionFormProps {
  jobCardId: string;
  type: InspectionType;
  inspectedBy: string;
  onSubmit: (payload: CreateInspectionPayload) => void | Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const InspectionForm: React.FC<InspectionFormProps> = ({
  jobCardId,
  type,
  inspectedBy,
  onSubmit,
  submitLabel = 'Submit Inspection',
  loading = false,
}) => {
  const [ratings, setRatings] = useState<Ratings>(defaultRatings());
  const [notes, setNotes] = useState('');
  const [roadTest, setRoadTest] = useState(false);

  const setRating = (key: ComponentKey, rating: InspectionRating) =>
    setRatings(prev => ({ ...prev, [key]: rating }));

  const handleSubmit = () => {
    const payload: CreateInspectionPayload = {
      job_card_id: jobCardId,
      type,
      ...ratings,
      notes: notes.trim() || undefined,
      road_test_done: type === 'post' ? roadTest : undefined,
    };
    onSubmit(payload);
  };

  const poorCount = Object.values(ratings).filter(r => r === 'poor').length;

  return (
    <View style={s.wrapper}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Header pill */}
        <View style={s.headerRow}>
          <View style={[s.typePill, { backgroundColor: type === 'pre' ? COLORS.primaryLight : COLORS.successLight }]}>
            <Text style={[s.typeText, { color: type === 'pre' ? COLORS.primary : COLORS.success }]}>
              {type === 'pre' ? 'Pre-Inspection' : 'Post-Inspection'}
            </Text>
          </View>
          {poorCount > 0 && (
            <View style={s.alertPill}>
              <Ionicons name="warning-outline" size={13} color={COLORS.danger} />
              <Text style={s.alertText}>{poorCount} issue{poorCount > 1 ? 's' : ''}</Text>
            </View>
          )}
        </View>

        {/* Checklist */}
        <Text style={s.sectionTitle}>Component Check</Text>
        {COMPONENTS.map(comp => (
          <View key={comp.key} style={s.componentRow}>
            <View style={s.compLeft}>
              <View style={[s.compIcon, { backgroundColor: ratings[comp.key] === 'poor' ? COLORS.dangerLight : COLORS.background }]}>
                <Ionicons name={comp.icon} size={18} color={ratings[comp.key] === 'poor' ? COLORS.danger : COLORS.textSecondary} />
              </View>
              <Text style={s.compLabel}>{comp.label}</Text>
            </View>
            <View style={s.ratingRow}>
              {RATINGS.map(r => {
                const selected = ratings[comp.key] === r.key;
                return (
                  <TouchableOpacity
                    key={r.key}
                    style={[s.ratingBtn, selected && { backgroundColor: r.bg, borderColor: r.color }]}
                    onPress={() => setRating(comp.key, r.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.ratingText, selected && { color: r.color }]}>{r.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Notes */}
        <Text style={[s.sectionTitle, { marginTop: SPACING.md }]}>Notes</Text>
        <TextInput
          style={s.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add inspection notes..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Road test (post only) */}
        {type === 'post' && (
          <View style={s.roadTestRow}>
            <View style={s.roadTestLeft}>
              <Ionicons name="car-sport-outline" size={20} color={COLORS.text} />
              <Text style={s.roadTestLabel}>Road Test Done</Text>
            </View>
            <Switch
              value={roadTest}
              onValueChange={setRoadTest}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>
        )}

        {/* Summary */}
        <View style={s.summary}>
          {RATINGS.slice(0, 3).map(r => {
            const count = Object.values(ratings).filter(v => v === r.key).length;
            return (
              <View key={r.key} style={[s.summaryItem, { backgroundColor: r.bg }]}>
                <Text style={[s.summaryCount, { color: r.color }]}>{count}</Text>
                <Text style={[s.summaryLabel, { color: r.color }]}>{r.label}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Submit */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.submitBtn, loading && s.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={s.submitText}>{loading ? 'Saving...' : submitLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingBottom: 100 },
  headerRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md, alignItems: 'center' },
  typePill: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full },
  typeText: { fontSize: FONT.sizes.sm, fontWeight: '700' },
  alertPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.dangerLight, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full },
  alertText: { fontSize: FONT.sizes.xs, color: COLORS.danger, fontWeight: '600' },
  sectionTitle: { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  componentRow: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.xs, ...SHADOW.sm },
  compLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs },
  compIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  compLabel: { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.text },
  ratingRow: { flexDirection: 'row', gap: SPACING.xs },
  ratingBtn: { flex: 1, paddingVertical: 6, borderRadius: RADIUS.sm, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  ratingText: { fontSize: FONT.sizes.xs, fontWeight: '600', color: COLORS.textMuted },
  notesInput: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.sm, fontSize: FONT.sizes.sm, color: COLORS.text, minHeight: 80, marginBottom: SPACING.sm, ...SHADOW.sm },
  roadTestRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginTop: SPACING.sm, ...SHADOW.sm },
  roadTestLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  roadTestLabel: { fontSize: FONT.sizes.md, fontWeight: '600', color: COLORS.text },
  summary: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  summaryItem: { flex: 1, borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: 'center' },
  summaryCount: { fontSize: FONT.sizes.xl, fontWeight: '800' },
  summaryLabel: { fontSize: FONT.sizes.xs, fontWeight: '600', marginTop: 2 },
  footer: { padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: FONT.sizes.md, fontWeight: '700' },
});
