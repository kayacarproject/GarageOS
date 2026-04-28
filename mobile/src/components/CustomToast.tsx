import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ToastType } from '../utils/toast';

// ─── Public handle exposed via ref ────────────────────────────────────────────

export interface CustomToastRef {
  show: (message: string, type: ToastType, duration?: number) => void;
}

// ─── Per-type visual config ───────────────────────────────────────────────────

const CONFIG = {
  success: {
    bg:          '#16A34A',
    iconBg:      'rgba(255,255,255,0.2)',
    icon:        'checkmark-circle' as const,
  },
  error: {
    bg:          '#DC2626',
    iconBg:      'rgba(255,255,255,0.2)',
    icon:        'alert-circle' as const,
  },
  info: {
    bg:          '#2563EB',
    iconBg:      'rgba(255,255,255,0.2)',
    icon:        'information-circle' as const,
  },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

interface ToastState {
  key:     number;
  message: string;
  type:    ToastType;
}

export const CustomToast = forwardRef<CustomToastRef>((_, ref) => {
  const [toast, setToast]  = useState<ToastState | null>(null);
  const translateY         = useRef(new Animated.Value(-120)).current;
  const opacity            = useRef(new Animated.Value(0)).current;
  const hideTimer          = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyCounter         = useRef(0);
  const insets             = useSafeAreaInsets();

  const runHideAnimation = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue:        -120,
        duration:       260,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue:        0,
        duration:       260,
        useNativeDriver: true,
      }),
    ]).start(() => setToast(null));
  }, [opacity, translateY]);

  const show = useCallback(
    (message: string, type: ToastType, duration = 3200) => {
      // Cancel any pending hide
      if (hideTimer.current) clearTimeout(hideTimer.current);

      // Snap animation values back so it re-enters cleanly
      translateY.stopAnimation();
      opacity.stopAnimation();
      translateY.setValue(-120);
      opacity.setValue(0);

      keyCounter.current += 1;
      setToast({ key: keyCounter.current, message, type });

      // Slide in with a spring for the bounce feel
      Animated.parallel([
        Animated.spring(translateY, {
          toValue:         0,
          damping:         18,
          stiffness:       220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue:         1,
          duration:        180,
          useNativeDriver: true,
        }),
      ]).start();

      hideTimer.current = setTimeout(runHideAnimation, duration);
    },
    [opacity, runHideAnimation, translateY],
  );

  useImperativeHandle(ref, () => ({ show }), [show]);

  if (!toast) return null;

  const cfg = CONFIG[toast.type];
  const topOffset = insets.top > 0 ? insets.top + 8 : (Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 24) + 8);

  return (
    // Outer fills screen but passes all touches through — only the toast strip intercepts
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[
          s.strip,
          {
            backgroundColor: cfg.bg,
            top:             topOffset,
            transform:       [{ translateY }],
            opacity,
          },
        ]}
        pointerEvents="none"
      >
        {/* Icon pill */}
        <View style={[s.iconWrap, { backgroundColor: cfg.iconBg }]}>
          <Ionicons name={cfg.icon} size={20} color="#fff" />
        </View>

        {/* Message */}
        <Text style={s.message} numberOfLines={2}>
          {toast.message}
        </Text>
      </Animated.View>
    </View>
  );
});

CustomToast.displayName = 'CustomToast';

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  strip: {
    position:     'absolute',
    left:         16,
    right:        16,
    flexDirection: 'row',
    alignItems:   'center',
    gap:          12,
    paddingVertical:   14,
    paddingHorizontal: 16,
    borderRadius:      14,
    // Shadow
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius:  10,
    elevation:     8,
    zIndex:        9999,
  },
  iconWrap: {
    width:         36,
    height:        36,
    borderRadius:  18,
    alignItems:    'center',
    justifyContent:'center',
    flexShrink:    0,
  },
  message: {
    flex:       1,
    fontSize:   14,
    fontWeight: '600',
    color:      '#fff',
    lineHeight: 20,
  },
});
