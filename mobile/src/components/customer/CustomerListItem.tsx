import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Customer } from '../../types';
import { Avatar } from '../common/Avatar';
import { PhoneMasked } from '../common/PhoneMasked';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchMode = 'name' | 'mobile';

interface Props {
  customer:    Customer;
  searchMode?: SearchMode;
  onPress:     () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CustomerListItem: React.FC<Props> = ({
  customer,
  searchMode = 'name',
  onPress,
}) => {
  const mobile = customer.mobile ?? customer.phone ?? '';

  /*
   * Masking rules per spec:
   *   name search mode   → always mask (forceMask=true, role ignored)
   *   mobile search mode → role-based (PhoneMasked respects canSeeFullMobile)
   */
  const forceMask = searchMode === 'name';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Avatar name={customer.name} size={44} />

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{customer.name}</Text>
          {customer.total_services !== undefined && customer.total_services > 0 && (
            <View style={styles.serviceChip}>
              <Ionicons name="construct-outline" size={10} color={COLORS.primary} />
              <Text style={styles.serviceCount}>
                {customer.total_services} service{customer.total_services !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        <PhoneMasked
          phone={mobile}
          forceMask={forceMask}
          revealable={!forceMask}
        />

        {customer.city && (
          <View style={styles.cityRow}>
            <Ionicons name="location-outline" size={11} color={COLORS.textMuted} />
            <Text style={styles.city}>{customer.city}</Text>
          </View>
        )}
      </View>

      {/* Search mode indicator */}
      {searchMode === 'mobile' && (
        <View style={styles.modePill}>
          <Ionicons name="call-outline" size={11} color={COLORS.primary} />
          <Text style={styles.modeText}>Phone</Text>
        </View>
      )}

      <Ionicons name="chevron-forward" size={16} color={COLORS.border} />
    </TouchableOpacity>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
    ...SHADOW.sm,
  },
  info:     { flex: 1, minWidth: 0 },
  nameRow:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: 2 },
  name:     { fontSize: FONT.sizes.md, fontWeight: FONT.weights.semibold, color: COLORS.text, flexShrink: 1 },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  serviceCount: { fontSize: 10, color: COLORS.primary, fontWeight: FONT.weights.semibold },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  city:    { fontSize: FONT.sizes.xs, color: COLORS.textMuted },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  modeText: { fontSize: FONT.sizes.xs, color: COLORS.primary, fontWeight: FONT.weights.semibold },
});
