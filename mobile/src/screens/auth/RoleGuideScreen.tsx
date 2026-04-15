import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/authService';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';
import { CREDENTIALS, type UserCredential } from '../../config/credentials';

// ─── Role Card ────────────────────────────────────────────────────────────────

const RoleCard: React.FC<{
  cred: UserCredential;
  onLogin: () => void;
  loading: boolean;
}> = ({ cred, onLogin, loading }) => (
  <View style={[s.card, { borderLeftColor: cred.color }]}>
    {/* Header */}
    <View style={s.cardHeader}>
      <View style={[s.iconBox, { backgroundColor: cred.bg }]}>
        <Ionicons name={cred.icon as any} size={18} color={cred.color} />
      </View>
      <View style={s.headerText}>
        <Text style={[s.roleLabel, { color: cred.color }]}>{cred.label}</Text>
        <Text style={s.roleName}>{cred.name}</Text>
      </View>
      <TouchableOpacity
        style={[s.loginBtn, { borderColor: cred.color }]}
        onPress={onLogin}
        disabled={loading}
        activeOpacity={0.75}
      >
        {loading
          ? <ActivityIndicator size={12} color={cred.color} />
          : <Text style={[s.loginBtnText, { color: cred.color }]}>Login →</Text>
        }
      </TouchableOpacity>
    </View>

    {/* Description */}
    <Text style={s.description}>{cred.description}</Text>

    {/* Credentials */}
    <View style={s.credRow}>
      <View style={[s.credPill, { backgroundColor: cred.color + '15', borderColor: cred.color + '40' }]}>
        <Ionicons name="call-outline" size={11} color={cred.color} />
        <Text style={[s.credPillText, { color: cred.color }]}>{cred.mobile}</Text>
      </View>
      <View style={[s.credPill, { backgroundColor: cred.color + '15', borderColor: cred.color + '40' }]}>
        <Ionicons name="lock-closed-outline" size={11} color={cred.color} />
        <Text style={[s.credPillText, { color: cred.color }]}>{cred.password}</Text>
      </View>
    </View>

    {/* Permissions */}
    <View style={s.permList}>
      {cred.permissions.map((p, i) => (
        <View key={i} style={s.permRow}>
          <View style={[s.dot, { backgroundColor: cred.color }]} />
          <Text style={s.permText}>{p}</Text>
        </View>
      ))}
    </View>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export const RoleGuideScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login, setLoading } = useAuthStore();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleQuickLogin = async (cred: UserCredential) => {
    setLoadingRole(cred.role);
    setLoading(true);
    try {
      const result = await authService.login(cred.mobile, cred.password);
      login(result.user, result.company, result.token);
      // AppNavigator auto-switches to role dashboard when isAuthenticated = true
    } catch {
      navigation.navigate('Login');
    } finally {
      setLoading(false);
      setLoadingRole(null);
    }
  };

  return (
    <SafeAreaView style={s.safe}>

      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={s.title}>Role Access Guide</Text>
        <Text style={s.subtitle}>Tap "Login →" on any role to sign in instantly</Text>
      </View>

      {/* ── Cards ── */}
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {CREDENTIALS.map(cred => (
          <RoleCard
            key={cred.role}
            cred={cred}
            onLogin={() => handleQuickLogin(cred)}
            loading={loadingRole === cred.role}
          />
        ))}

      </ScrollView>

      {/* ── Bottom bar ── */}
      <View style={s.bottomBar}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back-outline" size={16} color={COLORS.primary} />
          <Text style={s.backBtnText}>Back to Login</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  header:   { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.sm, alignItems: 'center' },
  title:    { fontSize: FONT.sizes.xl, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: FONT.sizes.sm, color: COLORS.textMuted, marginTop: 4, textAlign: 'center' },

  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, gap: SPACING.sm },

  // Card
  card:        { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderLeftWidth: 4, ...SHADOW.sm, gap: SPACING.sm },
  cardHeader:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  iconBox:     { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerText:  { flex: 1 },
  roleLabel:   { fontSize: FONT.sizes.md, fontWeight: '800' },
  roleName:    { fontSize: FONT.sizes.xs, color: COLORS.textMuted },
  loginBtn:    { paddingHorizontal: 14, paddingVertical: 6, borderRadius: RADIUS.full, borderWidth: 1.5, minWidth: 76, alignItems: 'center' },
  loginBtnText:{ fontSize: FONT.sizes.sm, fontWeight: '700' },

  description: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, fontStyle: 'italic' },

  // Credential pills
  credRow:     { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  credPill:    { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full, borderWidth: 1 },
  credPillText:{ fontSize: FONT.sizes.xs, fontWeight: '700' },

  // Permissions
  permList: { gap: 5 },
  permRow:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  dot:      { width: 7, height: 7, borderRadius: 4 },
  permText: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, flex: 1 },

  // Bottom bar
  bottomBar: { borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.surface, padding: SPACING.md },
  backBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.primary },
  backBtnText:{ fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.primary },
});
