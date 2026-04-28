import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity,
  TextInput as RNTextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mechanicApi } from '../../api/mechanicApi';
import { Button } from '../../components/common/Button';
import { showToast } from '../../utils/toast';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

// ─── Sub-components ───────────────────────────────────────────────────────────

const Field: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}> = ({ label, required, error, children }) => (
  <View style={s.field}>
    <Text style={s.label}>
      {label}
      {required && <Text style={s.required}> *</Text>}
    </Text>
    {children}
    {!!error && <Text style={s.errorText}>{error}</Text>}
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export const HanaAddMechanicScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [name,           setName]           = useState('');
  const [mobile,         setMobile]         = useState('');
  const [email,          setEmail]          = useState('');
  const [password,       setPassword]       = useState('');
  const [confirmPwd,     setConfirmPwd]     = useState('');
  const [experience,     setExperience]     = useState('');
  const [specialization, setSpecialization] = useState('');
  const [address,        setAddress]        = useState('');
  const [isActive,       setIsActive]       = useState(true);
  const [showPwd,        setShowPwd]        = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [errors,         setErrors]         = useState<Record<string, string>>({});

  const mobileRef = useRef<RNTextInput>(null);
  const emailRef  = useRef<RNTextInput>(null);
  const pwdRef    = useRef<RNTextInput>(null);
  const confirmRef= useRef<RNTextInput>(null);
  const expRef    = useRef<RNTextInput>(null);
  const specRef   = useRef<RNTextInput>(null);
  const addrRef   = useRef<RNTextInput>(null);

  const clearError = (key: string) =>
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim())                              e.name      = 'Full name is required';
    if (!mobile.trim())                            e.mobile    = 'Mobile number is required';
    else if (!/^\d{10}$/.test(mobile.trim()))      e.mobile    = 'Enter a valid 10-digit number';
    if (!password)                                 e.password  = 'Password is required';
    else if (password.length < 6)                  e.password  = 'Minimum 6 characters';
    if (!confirmPwd)                               e.confirmPwd = 'Please confirm the password';
    else if (password !== confirmPwd)              e.confirmPwd = 'Passwords do not match';
    if (email.trim() && !/\S+@\S+\.\S+/.test(email.trim()))
                                                   e.email     = 'Enter a valid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const trimmedName   = name.trim();
      const trimmedMobile = mobile.trim();
      await mechanicApi.create({
        legalname:      trimmedName,
        name:           trimmedMobile,
        mobile:         trimmedMobile,
        email:          email.trim() || undefined,
        password,
        experience:     experience.trim() || undefined,
        specialization: specialization.trim() || undefined,
        address:        address.trim() || undefined,
      });
      showToast('Mechanic added successfully', 'success');
      navigation.goBack();
    } catch (e: any) {
      showToast(e.message ?? 'Failed to add mechanic', 'error');
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
        showsVerticalScrollIndicator={false}
      >
        {/* ── Personal Info ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Personal Information</Text>

          <Field label="Full Name" required error={errors.name}>
            <TextInput
              style={[s.input, !!errors.name && s.inputError]}
              value={name}
              onChangeText={t => { setName(t); clearError('name'); }}
              placeholder="e.g. Ramesh Patel"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => mobileRef.current?.focus()}
            />
          </Field>

          <Field label="Mobile Number" required error={errors.mobile}>
            <TextInput
              ref={mobileRef}
              style={[s.input, !!errors.mobile && s.inputError]}
              value={mobile}
              onChangeText={t => { setMobile(t); clearError('mobile'); }}
              placeholder="10-digit mobile number"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="phone-pad"
              maxLength={10}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          </Field>

          <Field label="Email Address" error={errors.email}>
            <TextInput
              ref={emailRef}
              style={[s.input, !!errors.email && s.inputError]}
              value={email}
              onChangeText={t => { setEmail(t); clearError('email'); }}
              placeholder="ramesh@example.com (optional)"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => pwdRef.current?.focus()}
            />
          </Field>
        </View>

        {/* ── Security ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Login Credentials</Text>

          <Field label="Password" required error={errors.password}>
            <View style={s.pwdRow}>
              <TextInput
                ref={pwdRef}
                style={[s.input, s.inputFlex, !!errors.password && s.inputError]}
                value={password}
                onChangeText={t => { setPassword(t); clearError('password'); clearError('confirmPwd'); }}
                placeholder="Min 6 characters"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showPwd}
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
              />
              <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPwd(v => !v)}>
                <Ionicons
                  name={showPwd ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>
          </Field>

          <Field label="Confirm Password" required error={errors.confirmPwd}>
            <View style={s.pwdRow}>
              <TextInput
                ref={confirmRef}
                style={[s.input, s.inputFlex, !!errors.confirmPwd && s.inputError]}
                value={confirmPwd}
                onChangeText={t => { setConfirmPwd(t); clearError('confirmPwd'); }}
                placeholder="Re-enter password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showConfirmPwd}
                returnKeyType="next"
                onSubmitEditing={() => expRef.current?.focus()}
              />
              <TouchableOpacity style={s.eyeBtn} onPress={() => setShowConfirmPwd(v => !v)}>
                <Ionicons
                  name={showConfirmPwd ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>
          </Field>
        </View>

        {/* ── Professional Details ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Professional Details</Text>

          <Field label="Experience">
            <TextInput
              ref={expRef}
              style={s.input}
              value={experience}
              onChangeText={setExperience}
              placeholder="e.g. 3 years"
              placeholderTextColor={COLORS.textMuted}
              returnKeyType="next"
              onSubmitEditing={() => specRef.current?.focus()}
            />
          </Field>

          <Field label="Specialization">
            <TextInput
              ref={specRef}
              style={s.input}
              value={specialization}
              onChangeText={setSpecialization}
              placeholder="e.g. Engine, AC Repair, Electrical"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => addrRef.current?.focus()}
            />
          </Field>

          <Field label="Address">
            <TextInput
              ref={addrRef}
              style={[s.input, s.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder="Home or work address (optional)"
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </Field>
        </View>

        {/* ── Status Toggle ── */}
        <TouchableOpacity
          style={[s.statusRow, isActive && s.statusRowActive]}
          onPress={() => setIsActive(v => !v)}
          activeOpacity={0.8}
        >
          <View style={s.statusLeft}>
            <Ionicons
              name={isActive ? 'checkmark-circle' : 'close-circle-outline'}
              size={22}
              color={isActive ? COLORS.success : COLORS.textMuted}
            />
            <View>
              <Text style={[s.statusLabel, isActive && { color: COLORS.success }]}>
                {isActive ? 'Active' : 'Inactive'}
              </Text>
              <Text style={s.statusSub}>
                {isActive
                  ? 'Mechanic can be assigned to jobs'
                  : 'Mechanic will not appear in assignment list'}
              </Text>
            </View>
          </View>
          <View style={[s.toggle, isActive && s.toggleActive]}>
            <View style={[s.toggleThumb, isActive && s.toggleThumbActive]} />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Footer ── */}
      <View style={s.footer}>
        <Button
          title={saving ? 'Saving…' : 'Add Mechanic'}
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
  flex:      { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  content:   { padding: SPACING.md, paddingBottom: 20, gap: SPACING.md },

  section:      { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.sm, ...SHADOW.sm },
  sectionTitle: { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },

  field:     { gap: 6 },
  label:     { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.text },
  required:  { color: COLORS.danger },
  errorText: { fontSize: FONT.sizes.xs, color: COLORS.danger },

  input:      { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: 11, fontSize: FONT.sizes.md, color: COLORS.text, backgroundColor: COLORS.background },
  inputError: { borderColor: COLORS.danger },
  inputFlex:  { flex: 1 },
  textArea:   { minHeight: 72, paddingTop: 10 },

  pwdRow:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  eyeBtn:  { padding: 10, backgroundColor: COLORS.border, borderRadius: RADIUS.md },

  statusRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1.5, borderColor: 'transparent', ...SHADOW.sm },
  statusRowActive: { borderColor: COLORS.success, backgroundColor: COLORS.successLight },
  statusLeft:      { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  statusLabel:     { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.text },
  statusSub:       { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 2 },

  toggle:           { width: 44, height: 24, borderRadius: 12, backgroundColor: COLORS.border, padding: 2 },
  toggleActive:     { backgroundColor: COLORS.success },
  toggleThumb:      { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  toggleThumbActive:{ marginLeft: 20 },

  footer: { padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
});
