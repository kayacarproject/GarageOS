import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../../config/theme';

export const LoadingSpinner: React.FC<{ fullScreen?: boolean }> = ({ fullScreen }) => (
  <View style={[styles.container, fullScreen && styles.fullScreen]}>
    <ActivityIndicator size="large" color={COLORS.primary} />
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 32, alignItems: 'center', justifyContent: 'center' },
  fullScreen: { flex: 1, backgroundColor: COLORS.background },
});
