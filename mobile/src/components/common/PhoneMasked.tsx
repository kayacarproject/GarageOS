import React, { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { maskMobile, formatMobileDisplay } from '../../utils/phone';
import { COLORS, FONT } from '../../config/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  phone:       string;
  /** Force masked regardless of role — use in name-search mode */
  forceMask?:  boolean;
  /** Allow privileged users to tap to reveal */
  revealable?: boolean;
  style?:      TextStyle;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const PhoneMasked: React.FC<Props> = ({
  phone,
  forceMask  = false,
  revealable = false,
  style,
}) => {
  const canSeeFullMobile = useAuthStore((s) => s.canSeeFullMobile);
  const hasPermission    = canSeeFullMobile();

  const [revealed, setRevealed] = useState(false);

  // Determine whether to show full number
  const showFull = !forceMask && hasPermission && (!revealable || revealed);

  const displayText = showFull
    ? formatMobileDisplay(phone, true)
    : maskMobile(phone, false);

  // Privileged + revealable → show tap-to-reveal
  if (revealable && hasPermission && !forceMask) {
    return (
      <TouchableOpacity
        onPress={() => setRevealed((v) => !v)}
        style={styles.row}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        activeOpacity={0.7}
      >
        <Text style={[styles.text, style]}>{displayText}</Text>
        <Ionicons
          name={revealed ? 'eye-off-outline' : 'eye-outline'}
          size={13}
          color={COLORS.primary}
          style={styles.icon}
        />
      </TouchableOpacity>
    );
  }

  return <Text style={[styles.text, style]}>{displayText}</Text>;
};

const styles = StyleSheet.create({
  row:  { flexDirection: 'row', alignItems: 'center' },
  text: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary },
  icon: { marginLeft: 4 },
});
