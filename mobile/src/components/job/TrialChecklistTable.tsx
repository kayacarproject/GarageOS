import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';
import type { InspectionRating, Inspection, CreateInspectionPayload } from '../../types';

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

const RATING_COLOR: Record<InspectionRating, { color: string; bg: string; label: string }> = {
  good:    { color: COLORS.success,   bg: COLORS.successLight, label: 'Good' },
  average: { color: COLORS.warning,   bg: COLORS.warningLight, label: 'Avg'  },
  poor:    { color: COLORS.danger,    bg: COLORS.dangerLight,  label: 'Poor' },
  na:      { color: COLORS.textMuted, bg: '#F3F4F6',           label: 'N/A'  },
};

type PostRatings = Record<ComponentKey, InspectionRating>;
type DoneMap    = Record<ComponentKey, boolean>;

const defaultRatings = (): PostRatings =>
  Object.fromEntries(COMPONENTS.map(c => [c.key, 'good'])) as PostRatings;

const defaultDone = (): DoneMap =>
  Object.fromEntries(COMPONENTS.map(c => [c.key, false])) as DoneMap;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TrialChecklistTableProps {
  /** Pre-trial inspection data (read-only display) */
  preInspection?: Inspection | null;
  /**
   * pre-view  → if preInspection exists: read-only table
   *             if preInspection is null: editable form to DO the pre-trial
   * post-form → editable post-trial form, shows pre column read-only alongside
   */
  mode: 'pre-view' | 'post-form';
  jobCardId: string;
  onSubmit?: (payload: CreateInspectionPayload) => void | Promise<void>;
  submitLoading?: boolean;
}

// ─── Rating Pill (read-only display) ─────────────────────────────────────────

const RatingPill: React.FC<{ rating: InspectionRating }> = ({ rating }) => {
  const c = RATING_COLOR[rating];
  return (
    <View style={[pill.wrap, { backgroundColor: c.bg }]}>
      <Text style={[pill.text, { color: c.color }]}>{c.label}</Text>
    </View>
  );
};

const pill = StyleSheet.create({
  wrap: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full, alignItems: 'center', minWidth: 44 },
  text: { fontSize: FONT.sizes.xs, fontWeight: '700' },
});

// ─── Main Component ───────────────────────────────────────────────────────────

export const TrialChecklistTable: React.FC<TrialChecklistTableProps> = ({
  preInspection,
  mode,
  jobCardId,
  onSubmit,
  submitLoading = false,
}) => {
  const [postRatings, setPostRatings] = useState<PostRatings>(defaultRatings());
  const [done, setDone]               = useState<DoneMap>(defaultDone());
  const [notes, setNotes]             = useState('');
  const [roadTest, setRoadTest]       = useState(false);

  const toggleDone = (key: ComponentKey) =>
    setDone(prev => ({ ...prev, [key]: !prev[key] }));

  const setPostRating = (key: ComponentKey, rating: InspectionRating) =>
    setPostRatings(prev => ({ ...prev, [key]: rating }));

  const handleSubmit = () => {
    const undone = COMPONENTS.filter(c => !done[c.key]).map(c => c.label);
    if (undone.length > 0) {
      Alert.alert(
        'Incomplete Items',
        `These items are not ticked as done:\n${undone.join(', ')}\n\nSubmit anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', onPress: () => _submit() },
        ],
      );
      return;
    }
    _submit();
  };

  const _submit = () => {
    onSubmit?.({
      job_card_id: jobCardId,
      type: 'post',
      ...postRatings,
      notes: notes.trim() || undefined,
      road_test_done: roadTest,
    });
  };

  const isPreForm   = mode === 'pre-view' && !preInspection;  // doing pre-trial for first time
  const isPreView   = mode === 'pre-view' && !!preInspection; // viewing existing pre-trial
  const isPostForm  = mode === 'post-form';                   // doing post-trial

  // For pre-form, submit as type:'pre'
  const _submitPre = () => {
    onSubmit?.({
      job_card_id: jobCardId,
      type: 'pre',
      ...postRatings,
      notes: notes.trim() || undefined,
    });
  };

  const doneCount = Object.values(done).filter(Boolean).length;

  return (
    <View style={s.wrapper}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── Legend ── */}
        {!isPostForm && (
          <Text style={s.legendText}>
            {isPreForm ? 'Pre-Trial Checklist' : 'Pre-Trial (Read-only)'}
          </Text>
        )}

        {/* ── Table header ── */}
        <View style={s.tableHeader}>
          <Text style={[s.thCell, s.thComponent]}>Component</Text>
          {isPostForm && <Text style={[s.thCell, s.thPre]}>Pre</Text>}
          <Text style={[s.thCell, s.thPost]}>Rating</Text>
          {isPostForm && <Text style={[s.thCell, s.thDone]}>Done</Text>}
        </View>

        {/* ── Table rows ── */}
        {COMPONENTS.map((comp) => {
          const preRating = preInspection?.[comp.key] as InspectionRating | undefined;
          const isDone    = done[comp.key];

          return (
            <View key={comp.key} style={[s.tableRow, isDone && mode === 'post-form' && s.tableRowDone]}>
              {/* Component name */}
              <View style={s.tdComponent}>
                <Ionicons name={comp.icon} size={16} color={COLORS.textSecondary} />
                <Text style={s.tdLabel}>{comp.label}</Text>
              </View>

              {/* Pre rating column — only in post-form */}
              {isPostForm && (
                <View style={s.tdPreCol}>
                  {preRating ? <RatingPill rating={preRating} /> : <Text style={s.tdEmpty}>—</Text>}
                </View>
              )}

              {/* Rating column */}
              {isPreView ? (
                <View style={s.tdPreCol}>
                  {preRating ? <RatingPill rating={preRating} /> : <Text style={s.tdEmpty}>—</Text>}
                </View>
              ) : (
                <View style={s.tdPostChips}>
                  {(['good', 'average', 'poor'] as InspectionRating[]).map(r => {
                    const sel = postRatings[comp.key] === r;
                    const c   = RATING_COLOR[r];
                    return (
                      <TouchableOpacity
                        key={r}
                        style={[s.ratingChip, sel && { backgroundColor: c.bg, borderColor: c.color }]}
                        onPress={() => setPostRating(comp.key, r)}
                        activeOpacity={0.7}
                      >
                        <Text style={[s.ratingChipText, sel && { color: c.color }]}>{c.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Done tick — only in post-form */}
              {isPostForm && (
                <TouchableOpacity style={s.tdDone} onPress={() => toggleDone(comp.key)} activeOpacity={0.7}>
                  <View style={[s.tickBox, isDone && s.tickBoxDone]}>
                    {isDone && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* ── Notes ── */}
        {(isPreForm || isPostForm) && (
          <>
            <Text style={s.sectionTitle}>Notes</Text>
            <TextInput
              style={s.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder={isPreForm ? 'Pre-trial notes...' : 'Post-trial notes...'}
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </>
        )}

        {/* Road test — post-form only */}
        {isPostForm && (
          <TouchableOpacity
            style={[s.roadTestRow, roadTest && s.roadTestRowActive]}
            onPress={() => setRoadTest(v => !v)}
            activeOpacity={0.8}
          >
            <View style={s.roadTestLeft}>
              <Ionicons name="car-sport-outline" size={20} color={roadTest ? COLORS.success : COLORS.text} />
              <Text style={[s.roadTestLabel, roadTest && { color: COLORS.success }]}>Road Test Done</Text>
            </View>
            <View style={[s.tickBox, roadTest && s.tickBoxDone]}>
              {roadTest && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
          </TouchableOpacity>
        )}

        {/* Pre-view: show pre notes read-only */}
        {isPreView && preInspection?.notes && (
          <View style={s.preNotesBox}>
            <Text style={s.preNotesLabel}>Notes</Text>
            <Text style={s.preNotesText}>{preInspection.notes}</Text>
          </View>
        )}

      </ScrollView>

      {/* ── Submit footer ── */}
      {(isPreForm || isPostForm) && (
        <View style={s.footer}>
          {isPostForm && (
            <View style={s.progressBar}>
              <View style={[s.progressFill, { width: `${(doneCount / COMPONENTS.length) * 100}%` as any }]} />
            </View>
          )}
          <TouchableOpacity
            style={[s.submitBtn, submitLoading && s.submitBtnDisabled]}
            onPress={isPreForm ? _submitPre : handleSubmit}
            disabled={submitLoading}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={s.submitText}>
              {submitLoading ? 'Saving...' : isPreForm ? 'Submit Pre-Trial' : 'Submit Post-Trial'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  wrapper:          { flex: 1, backgroundColor: COLORS.background },
  content:          { padding: SPACING.md, paddingBottom: 120 },

  legendText:       { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, fontWeight: '600', marginBottom: SPACING.sm },

  // Table
  tableHeader:      { flexDirection: 'row', backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.sm, marginBottom: 4 },
  thCell:           { fontSize: FONT.sizes.xs, fontWeight: '700', color: '#fff' },
  thComponent:      { flex: 2 },
  thPre:            { flex: 1.2, textAlign: 'center' },
  thPost:           { flex: 2.5, textAlign: 'center' },
  thDone:           { width: 48, textAlign: 'center' },

  tableRow:         { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.md, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.sm, marginBottom: SPACING.xs, ...SHADOW.sm },
  tableRowDone:     { backgroundColor: '#F0FDF4' },

  tdComponent:      { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8 },
  tdLabel:          { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.text },
  tdPreCol:         { flex: 1.2, alignItems: 'center' },
  tdPostChips:      { flex: 2.5, flexDirection: 'row', gap: 6, alignItems: 'center' },
  tdDone:           { width: 48, alignItems: 'center' },
  tdEmpty:          { fontSize: FONT.sizes.sm, color: COLORS.textMuted, textAlign: 'center' },

  ratingChip:       { flex: 1, paddingVertical: 7, borderRadius: RADIUS.sm, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  ratingChipText:   { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.textMuted },

  tickBox:          { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  tickBoxDone:      { backgroundColor: COLORS.success, borderColor: COLORS.success },

  sectionTitle:     { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md, marginBottom: SPACING.sm },
  notesInput:       { backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.sm, fontSize: FONT.sizes.sm, color: COLORS.text, minHeight: 80, ...SHADOW.sm },

  roadTestRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginTop: SPACING.sm, borderWidth: 1.5, borderColor: 'transparent', ...SHADOW.sm },
  roadTestRowActive:{ borderColor: COLORS.success, backgroundColor: COLORS.successLight },
  roadTestLeft:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  roadTestLabel:    { fontSize: FONT.sizes.md, fontWeight: '600', color: COLORS.text },

  preNotesBox:      { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginTop: SPACING.md, ...SHADOW.sm },
  preNotesLabel:    { fontSize: FONT.sizes.xs, fontWeight: '700', color: COLORS.textMuted, marginBottom: 4 },
  preNotesText:     { fontSize: FONT.sizes.sm, color: COLORS.text },

  footer:           { padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border, gap: SPACING.sm },
  progressBar:      { height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' },
  progressFill:     { height: 4, backgroundColor: COLORS.success, borderRadius: 2 },
  submitBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.success, borderRadius: RADIUS.lg, paddingVertical: SPACING.md },
  submitBtnDisabled:{ opacity: 0.6 },
  submitText:       { color: '#fff', fontSize: FONT.sizes.md, fontWeight: '700' },
});
