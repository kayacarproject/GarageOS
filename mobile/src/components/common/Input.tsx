import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, FONT } from '../../config/theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

export const Input: React.FC<Props> = ({ label, error, leftIcon, rightIcon, onRightIconPress, secureTextEntry, style, ...rest }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error ? styles.inputError : styles.inputNormal]}>
        {leftIcon && <Ionicons name={leftIcon} size={18} color={COLORS.textMuted} style={styles.leftIcon} />}
        <TextInput
          style={[styles.input, leftIcon && styles.inputWithLeft, style]}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={isPassword && !showPassword}
          {...rest}
        />
        {isPassword ? (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.rightIcon}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Ionicons name={rightIcon} size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  label: { fontSize: FONT.sizes.sm, fontWeight: '500', color: COLORS.text, marginBottom: SPACING.xs },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.md, borderWidth: 1.5, backgroundColor: COLORS.surface, minHeight: 48 },
  inputNormal: { borderColor: COLORS.border },
  inputError: { borderColor: COLORS.error },
  input: { flex: 1, paddingHorizontal: SPACING.md, fontSize: FONT.sizes.md, color: COLORS.text, paddingVertical: SPACING.sm },
  inputWithLeft: { paddingLeft: SPACING.xs },
  leftIcon: { marginLeft: SPACING.md },
  rightIcon: { paddingHorizontal: SPACING.md },
  error: { fontSize: FONT.sizes.xs, color: COLORS.error, marginTop: SPACING.xs },
});
