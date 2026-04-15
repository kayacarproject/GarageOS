import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { Avatar } from '../../components/common/Avatar';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';
import { Ionicons } from '@expo/vector-icons';

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  OWNER:        { color: COLORS.primary,  bg: COLORS.primaryLight,  label: 'Owner' },
  SUPER_ADMIN:  { color: '#7C3AED',       bg: '#EDE9FE',            label: 'Super Admin' },
  MANAGER:      { color: '#7C3AED',       bg: '#EDE9FE',            label: 'Manager' },
  MECHANIC:     { color: COLORS.success,  bg: COLORS.successLight,  label: 'Mechanic' },
  RECEPTIONIST: { color: COLORS.warning,  bg: COLORS.warningLight,  label: 'Receptionist' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ActionRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  iconBg?: string;
  iconColor?: string;
  danger?: boolean;
}> = ({ icon, label, subtitle, onPress, iconBg, iconColor, danger }) => (
  <TouchableOpacity style={s.actionRow} onPress={onPress} activeOpacity={0.7}>
    <View style={[s.actionIconBox, { backgroundColor: iconBg ?? (danger ? COLORS.dangerLight : COLORS.primaryLight) }]}>
      <Ionicons name={icon} size={18} color={iconColor ?? (danger ? COLORS.danger : COLORS.primary)} />
    </View>
    <View style={s.actionText}>
      <Text style={[s.actionLabel, danger && { color: COLORS.danger }]}>{label}</Text>
      {subtitle ? <Text style={s.actionSub}>{subtitle}</Text> : null}
    </View>
    <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
  </TouchableOpacity>
);

const PermBadge: React.FC<{ label: string; allowed: boolean }> = ({ label, allowed }) => (
  <View style={[s.permBadge, { backgroundColor: allowed ? COLORS.successLight : '#F3F4F6' }]}>
    <Ionicons
      name={allowed ? 'checkmark-circle' : 'close-circle'}
      size={13}
      color={allowed ? COLORS.success : COLORS.textMuted}
    />
    <Text style={[s.permText, { color: allowed ? COLORS.success : COLORS.textMuted }]}>{label}</Text>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const {
    user, company, logout,
    canSeeFullMobile, canViewFinancials, canApproveEstimate,
    canAssignMechanic, canManageUsers, canCreateJobCard,
  } = useAuthStore();

  if (!user) return null;

  const roleCfg   = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.OWNER;
  const initials  = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero card ── */}
      <View style={[s.heroCard, { backgroundColor: roleCfg.color }]}>
        <Avatar name={user.name} size={72} />
        <Text style={s.heroName}>{user.name}</Text>
        <Text style={s.heroMobile}>{user.mobile ?? user.phone}</Text>
        {user.email ? <Text style={s.heroEmail}>{user.email}</Text> : null}
        <View style={s.rolePill}>
          <Text style={[s.roleText, { color: roleCfg.color }]}>{roleCfg.label}</Text>
        </View>
      </View>

      {/* ── Company ── */}
      {company && (
        <View style={s.companyCard}>
          <View style={[s.companyIconBox, { backgroundColor: COLORS.primaryLight }]}>
            <Ionicons name="business-outline" size={20} color={COLORS.primary} />
          </View>
          <View style={s.companyInfo}>
            <Text style={s.companyName}>{company.name}</Text>
            <Text style={s.companyMobile}>{company.mobile}</Text>
          </View>
          <View style={[s.planBadge, { backgroundColor: COLORS.primaryLight }]}>
            <Text style={[s.planText, { color: COLORS.primary }]}>
              {company.subscription_plan.toUpperCase()}
            </Text>
          </View>
        </View>
      )}

      {/* ── Quick navigation ── */}
      <Text style={s.sectionTitle}>Quick Access</Text>
      <View style={s.card}>
        <ActionRow
          icon="construct-outline"
          label="Jobs"
          subtitle="View all job cards"
          iconBg={COLORS.infoLight}
          iconColor={COLORS.info}
          onPress={() => navigation.navigate('Jobs')}
        />
        <View style={s.divider} />
        <ActionRow
          icon="people-outline"
          label="Customers"
          subtitle="Manage customer list"
          onPress={() => navigation.navigate('Customers')}
        />
        <View style={s.divider} />
        <ActionRow
          icon="notifications-outline"
          label="Notifications"
          onPress={() => navigation.navigate('Notifications')}
        />
        {canViewFinancials() && (
          <>
            <View style={s.divider} />
            <ActionRow
              icon="bar-chart-outline"
              label="Revenue Report"
              iconBg={COLORS.successLight}
              iconColor={COLORS.success}
              onPress={() => navigation.navigate('Revenue')}
            />
          </>
        )}
        {canApproveEstimate() && (
          <>
            <View style={s.divider} />
            <ActionRow
              icon="checkmark-circle-outline"
              label="Pending Approvals"
              iconBg={COLORS.warningLight}
              iconColor={COLORS.warning}
              onPress={() => navigation.navigate('Approvals')}
            />
          </>
        )}
        {canAssignMechanic() && (
          <>
            <View style={s.divider} />
            <ActionRow
              icon="people-circle-outline"
              label="Mechanics"
              subtitle="Manage mechanic list"
              iconBg={COLORS.successLight}
              iconColor={COLORS.success}
              onPress={() => navigation.navigate('Mechanics')}
            />
          </>
        )}
      </View>

      {/* ── Permissions ── */}
      <Text style={s.sectionTitle}>Your Permissions</Text>
      <View style={s.permGrid}>
        <PermBadge label="Full Mobile"      allowed={canSeeFullMobile()} />
        <PermBadge label="Financials"       allowed={canViewFinancials()} />
        <PermBadge label="Approve Estimate" allowed={canApproveEstimate()} />
        <PermBadge label="Assign Mechanic"  allowed={canAssignMechanic()} />
        <PermBadge label="Manage Users"     allowed={canManageUsers()} />
        <PermBadge label="Create Job Card"  allowed={canCreateJobCard()} />
      </View>

      {/* ── Sign out ── */}
      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
        <Text style={s.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content:   { paddingBottom: SPACING.xxl },

  // Hero
  heroCard:   { alignItems: 'center', paddingTop: SPACING.xl, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.lg, gap: SPACING.xs, marginBottom: SPACING.md },
  heroName:   { fontSize: FONT.sizes.xl, fontWeight: '800', color: '#fff', marginTop: SPACING.sm },
  heroMobile: { fontSize: FONT.sizes.sm, color: 'rgba(255,255,255,0.8)' },
  heroEmail:  { fontSize: FONT.sizes.xs, color: 'rgba(255,255,255,0.65)' },
  rolePill:   { backgroundColor: '#fff', paddingHorizontal: SPACING.md, paddingVertical: 5, borderRadius: RADIUS.full, marginTop: SPACING.xs },
  roleText:   { fontSize: FONT.sizes.xs, fontWeight: '800' },

  // Company
  companyCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, marginHorizontal: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.sm, ...SHADOW.sm, marginBottom: SPACING.md },
  companyIconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  companyInfo:    { flex: 1 },
  companyName:    { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  companyMobile:  { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  planBadge:      { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full },
  planText:       { fontSize: FONT.sizes.xs, fontWeight: '700' },

  // Section
  sectionTitle: { fontSize: FONT.sizes.xs, fontWeight: '700', color: COLORS.textMuted, marginHorizontal: SPACING.lg, marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 0.8 },

  // Actions card
  card:          { backgroundColor: COLORS.surface, marginHorizontal: SPACING.md, borderRadius: RADIUS.lg, ...SHADOW.sm, marginBottom: SPACING.md, overflow: 'hidden' },
  actionRow:     { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm },
  actionIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionText:    { flex: 1 },
  actionLabel:   { fontSize: FONT.sizes.md, color: COLORS.text, fontWeight: '500' },
  actionSub:     { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 1 },
  divider:       { height: 1, backgroundColor: COLORS.border, marginLeft: SPACING.md + 36 + SPACING.sm },

  // Permissions
  permGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginHorizontal: SPACING.md, marginBottom: SPACING.md },
  permBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: RADIUS.full },
  permText:  { fontSize: FONT.sizes.xs, fontWeight: '600' },

  // Logout
  logoutBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.dangerLight, borderRadius: RADIUS.lg, padding: SPACING.md, marginHorizontal: SPACING.md, ...SHADOW.sm },
  logoutText: { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.danger },
});
