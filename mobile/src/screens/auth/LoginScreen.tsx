import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity,
  TextInput as RNTextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';
import { CREDENTIALS } from '../../config/credentials';
import env from '../../config/env';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [mobile, setMobile]       = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [showCreds, setShowCreds] = useState(false);
  const { login, isLoading }      = useAuth();

  const passwordRef = useRef<RNTextInput>(null);

  const handleLogin = async () => {
    setError('');
    if (!mobile.trim()) { setError('Mobile number is required'); return; }
    if (!password)      { setError('Password is required'); return; }

    try {
      await login(mobile.trim(), password);
      // Navigation handled automatically by AppNavigator when isAuthenticated flips
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong. Please try again.');
    }
  };

  // Tap a credential row → auto-fill mobile + password
  const fillCred = (m: string, p: string) => {
    setMobile(m);
    setPassword(p);
    setError('');
    setShowCreds(false);
  };

  return (
    <KeyboardAvoidingView
      style={s.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={s.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Logo ── */}
        <View style={s.logoBox}>
          <View style={s.logoIcon}>
            <Text style={s.logoEmoji}>🔧</Text>
          </View>
          <Text style={s.logoText}>GarageOS</Text>
          <Text style={s.tagline}>Smart Garage Management</Text>
        </View>

        {/* ── Form card ── */}
        <View style={s.card}>
          <Text style={s.title}>Sign In</Text>
          <Text style={s.subtitle}>Enter your mobile number and password</Text>

          <Input
            label="Mobile Number"
            value={mobile}
            onChangeText={v => { setMobile(v); setError(''); }}
            placeholder="10-digit mobile number"
            leftIcon="call-outline"
            keyboardType="phone-pad"
            maxLength={10}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <Input
            label="Password"
            value={password}
            onChangeText={v => { setPassword(v); setError(''); }}
            placeholder="Enter your password"
            leftIcon="lock-closed-outline"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          {!!error && (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle-outline" size={15} color={COLORS.danger} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            size="lg"
            fullWidth
            style={s.loginBtn}
          />
          <Button
            title="Forgot Password?"
            onPress={() => navigation.navigate('ForgotPassword')}
            variant="ghost"
          />
        </View>

        {/* ── Dev credential table (only in dev / dummy mode) ── */}
        {env.USE_DUMMY_DATA && (
          <View style={s.devBox}>
            <TouchableOpacity
              style={s.devToggle}
              onPress={() => setShowCreds(v => !v)}
              activeOpacity={0.8}
            >
              <Ionicons name="key-outline" size={15} color="#92400E" />
              <Text style={s.devToggleText}>
                Demo credentials — tap to {showCreds ? 'hide' : 'show'}
              </Text>
              <Ionicons
                name={showCreds ? 'chevron-up' : 'chevron-down'}
                size={15}
                color="#92400E"
              />
            </TouchableOpacity>

            {showCreds && (
              <View style={s.credTable}>
                {/* Table header */}
                <View style={[s.credRow, s.credHeaderRow]}>
                  <Text style={[s.credHeaderCell, { flex: 1.3 }]}>Role</Text>
                  <Text style={[s.credHeaderCell, { flex: 1.8 }]}>Mobile</Text>
                  <Text style={[s.credHeaderCell, { flex: 1.8 }]}>Password</Text>
                </View>

                {/* One row per credential — tap to auto-fill */}
                {CREDENTIALS.map((c, i) => (
                  <TouchableOpacity
                    key={c.role}
                    style={[s.credRow, i % 2 === 1 && s.credRowAlt]}
                    onPress={() => fillCred(c.mobile, c.password)}
                    activeOpacity={0.7}
                  >
                    <View style={[s.credRoleCell, { flex: 1.3 }]}>
                      <View style={[s.roleDot, { backgroundColor: c.color }]} />
                      <Text style={[s.credRoleText, { color: c.color }]}>{c.label}</Text>
                    </View>
                    <Text style={[s.credValueText, { flex: 1.8 }]}>{c.mobile}</Text>
                    <Text style={[s.credValueText, { flex: 1.8 }]}>{c.password}</Text>
                  </TouchableOpacity>
                ))}

                <Text style={s.tapHint}>↑ Tap any row to auto-fill the form</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Role guide link ── */}
        {/* <TouchableOpacity
          style={s.guideLink}
          onPress={() => navigation.navigate('RoleGuide')}
          activeOpacity={0.7}
        >
          <Ionicons name="information-circle-outline" size={15} color={COLORS.primary} />
          <Text style={s.guideLinkText}>What can each role do?</Text>
        </TouchableOpacity> */}

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  flex:      { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, padding: SPACING.lg, paddingBottom: SPACING.xxl },

  // Logo
  logoBox:   { alignItems: 'center', marginBottom: SPACING.xl, marginTop: SPACING.lg },
  logoIcon:  { width: 72, height: 72, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  logoEmoji: { fontSize: 36 },
  logoText:  { fontSize: FONT.sizes.xxxl, fontWeight: '800', color: COLORS.text },
  tagline:   { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginTop: 4 },

  // Form card
  card:     { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xl, ...SHADOW.md },
  title:    { fontSize: FONT.sizes.xxl, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  loginBtn: { marginTop: SPACING.xs, marginBottom: SPACING.xs },

  // Error
  errorBox:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, backgroundColor: COLORS.dangerLight, borderRadius: RADIUS.sm, padding: SPACING.sm, marginBottom: SPACING.sm },
  errorText: { fontSize: FONT.sizes.sm, color: COLORS.danger, flex: 1 },

  // Dev box
  devBox:        { marginTop: SPACING.lg, backgroundColor: '#FFFBEB', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: '#FDE68A', overflow: 'hidden' },
  devToggle:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, padding: SPACING.md },
  devToggleText: { flex: 1, fontSize: FONT.sizes.sm, fontWeight: '600', color: '#92400E' },

  // Credential table
  credTable:     { borderTopWidth: 1, borderTopColor: '#FDE68A' },
  credHeaderRow: { backgroundColor: '#FEF3C7' },
  credHeaderCell:{ fontSize: FONT.sizes.xs, fontWeight: '700', color: '#92400E', paddingHorizontal: SPACING.md, paddingVertical: 8 },
  credRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  credRowAlt:    { backgroundColor: '#FFFBEB' },
  credRoleCell:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: SPACING.md },
  roleDot:       { width: 7, height: 7, borderRadius: 4 },
  credRoleText:  { fontSize: FONT.sizes.xs, fontWeight: '700' },
  credValueText: { fontSize: FONT.sizes.xs, color: COLORS.textSecondary },
  tapHint:       { fontSize: FONT.sizes.xs, color: '#92400E', textAlign: 'center', paddingVertical: SPACING.sm, opacity: 0.7 },

  // Guide link
  guideLink:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, marginTop: SPACING.lg, paddingVertical: SPACING.sm },
  guideLinkText: { fontSize: FONT.sizes.sm, color: COLORS.primary, fontWeight: '600' },
});
