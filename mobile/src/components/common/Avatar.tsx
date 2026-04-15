import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, FONT } from '../../config/theme';

interface Props {
  name: string;
  size?: number;
  imageUrl?: string;
}

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

const colors = ['#2563EB', '#7C3AED', '#DB2777', '#059669', '#D97706'];
const getColor = (name: string) => colors[name.charCodeAt(0) % colors.length];

export const Avatar: React.FC<Props> = ({ name, size = 40 }) => (
  <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: getColor(name) }]}>
    <Text style={[styles.initials, { fontSize: size * 0.35 }]}>{getInitials(name)}</Text>
  </View>
);

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#fff', fontWeight: '700' },
});
