import {
  useFonts as useExpoFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Loads all app fonts at startup.
 * Call once in App.tsx — block render until fontsLoaded is true.
 *
 * @returns { fontsLoaded, fontError }
 *   fontsLoaded — true when all fonts are ready
 *   fontError   — non-null if any font failed (app still renders with system fonts)
 */
export function useAppFonts(): { fontsLoaded: boolean; fontError: Error | null } {
  const [fontsLoaded, fontError] = useExpoFonts({
    // ── Poppins ───────────────────────────────────────────────────────────────
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,

    // ── Inter ─────────────────────────────────────────────────────────────────
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  return { fontsLoaded, fontError };
}
