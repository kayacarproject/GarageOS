import React, { useMemo, useRef, useState } from 'react';
import {
  View, TextInput, Text, TouchableOpacity,
  StyleSheet, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, FONT, ANIMATION } from '../../config/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SearchMode = 'name' | 'mobile' | 'auto';

interface Props {
  value:          string;
  onChangeText:   (text: string) => void;
  onModeChange?:  (mode: 'name' | 'mobile') => void;
  placeholder?:   string;
  mode?:          SearchMode;  // force a mode; 'auto' detects from input
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isNumeric = (val: string) => /^\d+$/.test(val.replace(/\s/g, ''));

function resolveMode(value: string, forced: SearchMode): 'name' | 'mobile' {
  if (forced === 'name')   return 'name';
  if (forced === 'mobile') return 'mobile';
  return value.length > 0 && isNumeric(value) ? 'mobile' : 'name';
}

const HINT: Record<'name' | 'mobile', string> = {
  mobile: 'Searching by phone number',
  name:   'Searching by name (phone masked)',
};

// ─── Component ────────────────────────────────────────────────────────────────

export const SearchBar: React.FC<Props> = ({
  value,
  onChangeText,
  onModeChange,
  placeholder = 'Search by name or phone...',
  mode = 'auto',
}) => {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const activeMode = useMemo(() => resolveMode(value, mode), [value, mode]);

  const handleChange = (text: string) => {
    onChangeText(text);
    const newMode = resolveMode(text, mode);
    onModeChange?.(newMode);
  };

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: ANIMATION.fade.duration,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: ANIMATION.fade.duration,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.border, COLORS.primary],
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, { borderColor }]}>
        <Ionicons name="search-outline" size={17} color={focused ? COLORS.primary : COLORS.textMuted} style={styles.searchIcon} />

        <TextInput
          value={value}
          onChangeText={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          keyboardType={activeMode === 'mobile' ? 'phone-pad' : 'default'}
          style={styles.input}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />

        {/* Mode indicator */}
        {value.length > 0 && (
          <View style={styles.modeChip}>
            <Ionicons
              name={activeMode === 'mobile' ? 'call-outline' : 'person-outline'}
              size={12}
              color={COLORS.primary}
            />
          </View>
        )}

        {/* Clear button */}
        {value.length > 0 && (
          <TouchableOpacity onPress={() => handleChange('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={17} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Hint text */}
      {value.length > 0 && (
        <Text style={styles.hint}>
          <Ionicons
            name={activeMode === 'mobile' ? 'call-outline' : 'person-outline'}
            size={11}
            color={COLORS.primary}
          />{' '}
          {HINT[activeMode]}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper:    { gap: 4 },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.md,
    height: 44,
    gap: SPACING.xs,
  },
  searchIcon: { flexShrink: 0 },
  input: {
    flex: 1,
    fontSize: FONT.sizes.md,
    color: COLORS.text,
    paddingVertical: 0,
  },
  modeChip: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontSize: FONT.sizes.xs,
    color: COLORS.primary,
    paddingLeft: 2,
    fontWeight: FONT.weights.medium,
  },
});
