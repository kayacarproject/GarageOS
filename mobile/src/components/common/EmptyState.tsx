import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT } from '../../config/theme';

interface Props {
  title?: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const EmptyState: React.FC<Props> = ({ title = 'Nothing here', message = 'No data to display', icon = 'folder-open-outline' }) => (
  <View style={styles.container}>
    <View style={styles.iconBox}>
      <Ionicons name={icon} size={48} color={COLORS.textMuted} />
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  iconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  title: { fontSize: FONT.sizes.lg, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs },
  message: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, textAlign: 'center' },
});
