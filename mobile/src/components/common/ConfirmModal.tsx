import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { COLORS, RADIUS, SPACING, FONT, SHADOW } from '../../config/theme';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export const ConfirmModal: React.FC<Props> = ({ visible, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, danger }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={[styles.iconBox, { backgroundColor: danger ? COLORS.errorLight : COLORS.primaryLight }]}>
          <Ionicons name={danger ? 'warning-outline' : 'help-circle-outline'} size={28} color={danger ? COLORS.error : COLORS.primary} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actions}>
          <Button title={cancelLabel} onPress={onCancel} variant="outline" style={styles.btn} />
          <Button title={confirmLabel} onPress={onConfirm} variant={danger ? 'danger' : 'primary'} style={styles.btn} />
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
  modal: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xl, width: '100%', alignItems: 'center', ...SHADOW.md },
  iconBox: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  title: { fontSize: FONT.sizes.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs, textAlign: 'center' },
  message: { fontSize: FONT.sizes.md, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.lg },
  actions: { flexDirection: 'row', gap: SPACING.sm, width: '100%' },
  btn: { flex: 1 },
});
