import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform, TextInput as RNTextInput,
} from 'react-native';
import { useMechanicStore } from '../../stores/mechanicStore';
import { Button } from '../../components/common/Button';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

// ─── Field ────────────────────────────────────────────────────────────────────

const Field: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
}> = ({ label, required, children, error }) => (
  <View style={s.field}>
    <Text style={s.label}>
      {label}{required && <Text style={s.required}> *</Text>}
    </Text>
    {children}
    {!!error && <Text style={s.errorText}>{error}</Text>}
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export const AddMechanicScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { add } = useMechanicStore();

  const [name, setName]               = useState('');
  const [phone, setPhone]             = useState('');
  const [specialization, setSpec]     = useState('');
  const [saving, setSaving]           = useState(false);
  const [errors, setErrors]           = useState<{ name?: string; phone?: string }>({});

  const phoneRef = useRef<RNTextInput>(null);
  const specRef  = useRef<RNTextInput>(null);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!name.trim())                          e.name  = 'Name is required.';
    if (!phone.trim())                         e.phone = 'Phone number is required.';
    else if (!/^\d{10}$/.test(phone.trim()))   e.phone = 'Enter a valid 10-digit phone number.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await add(name.trim(), phone.trim(), specialization.trim() || undefined);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not add mechanic. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.card}>
          <Field label="Full Name" required error={errors.name}>
            <TextInput
              style={[s.input, !!errors.name && s.inputError]}
              value={name}
              onChangeText={t => { setName(t); setErrors(p => ({ ...p, name: undefined })); }}
              placeholder="e.g. Ramesh Kumar"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
            />
          </Field>

          <Field label="Phone Number" required error={errors.phone}>
            <TextInput
              ref={phoneRef}
              style={[s.input, !!errors.phone && s.inputError]}
              value={phone}
              onChangeText={t => { setPhone(t); setErrors(p => ({ ...p, phone: undefined })); }}
              placeholder="10-digit mobile number"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="phone-pad"
              maxLength={10}
              returnKeyType="next"
              onSubmitEditing={() => specRef.current?.focus()}
            />
          </Field>

          <Field label="Specialization">
            <TextInput
              ref={specRef}
              style={s.input}
              value={specialization}
              onChangeText={setSpec}
              placeholder="e.g. Engine, Electrical, AC Repair"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </Field>
        </View>
      </ScrollView>

      <View style={s.footer}>
        <Button
          title="Add Mechanic"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          fullWidth
          size="lg"
          icon="person-add-outline"
        />
      </View>
    </KeyboardAvoidingView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  flex:       { flex: 1, backgroundColor: COLORS.background },
  container:  { flex: 1 },
  content:    { padding: SPACING.md, paddingBottom: 20 },

  card:       { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOW.sm, gap: SPACING.sm },

  field:      { gap: 6 },
  label:      { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.text },
  required:   { color: COLORS.danger },
  input:      { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: 11, fontSize: FONT.sizes.md, color: COLORS.text, backgroundColor: COLORS.background },
  inputError: { borderColor: COLORS.danger },
  errorText:  { fontSize: FONT.sizes.xs, color: COLORS.danger },

  footer:     { padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
});
