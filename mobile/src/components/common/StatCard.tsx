import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  label:       string;
  value:       string | number;
  subtext?:    string;
  valueColor?: string;
  icon?:       keyof typeof Ionicons.glyphMap;
  iconColor?:  string;
  iconBg?:     string;
  trend?:      { value: string; positive: boolean };
  onPress?:    () => void;
  style?:      ViewStyle;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const StatCard: React.FC<Props> = ({
  label,
  value,
  subtext,
  valueColor,
  icon,
  iconColor = COLORS.primary,
  iconBg    = COLORS.primaryLight,
  trend,
  onPress,
  style,
}) => {
  const content = (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        {icon && (
          <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
        )}
        {trend && (
          <View style={[
            styles.trend,
            { backgroundColor: trend.positive ? COLORS.successLight : COLORS.errorLight },
          ]}>
            <Ionicons
              name={trend.positive ? 'trending-up' : 'trending-down'}
              size={11}
              color={trend.positive ? COLORS.success : COLORS.error}
            />
            <Text style={[styles.trendText, { color: trend.positive ? COLORS.success : COLORS.error }]}>
              {trend.value}
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.value, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
      {subtext && <Text style={styles.subtext}>{subtext}</Text>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={style}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flex: 1,
    minWidth: 148,
    ...SHADOW.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value:    { fontSize: FONT.sizes.xxl, fontWeight: FONT.weights.bold, color: COLORS.text, marginBottom: 2 },
  label:    { fontSize: FONT.sizes.sm,  fontWeight: FONT.weights.medium, color: COLORS.textSecondary },
  subtext:  { fontSize: FONT.sizes.xs,  color: COLORS.textMuted, marginTop: 2 },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    gap: 2,
  },
  trendText: { fontSize: FONT.sizes.xs, fontWeight: FONT.weights.semibold },
});
