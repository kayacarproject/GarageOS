import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getStatusLabel, getStatusColors } from '../../constants/jobCardLifecycle';
import type { JobCardStatus } from '../../types';
import { RADIUS, SPACING, FONT } from '../../config/theme';

export const JobStatusBadge: React.FC<{ status: JobCardStatus; large?: boolean }> = ({ status, large }) => {
  const { bg, text, dot } = getStatusColors(status);
  return (
    <View style={[s.badge, { backgroundColor: bg }, large && s.large]}>
      <View style={[s.dot, { backgroundColor: dot }]} />
      <Text style={[s.text, { color: text }, large && s.largeText]}>{getStatusLabel(status)}</Text>
    </View>
  );
};

const s = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full, alignSelf: 'flex-start', gap: 5 },
  large: { paddingHorizontal: SPACING.md, paddingVertical: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  text: { fontSize: FONT.sizes.xs, fontWeight: '600' },
  largeText: { fontSize: FONT.sizes.sm },
});
