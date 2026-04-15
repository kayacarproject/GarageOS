import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SHADOW, SPACING } from '../../config/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export const Card: React.FC<Props> = ({ children, style, padding = SPACING.md }) => (
  <View style={[styles.card, { padding }, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    ...SHADOW.md,
  },
});
