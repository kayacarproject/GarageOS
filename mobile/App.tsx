import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useAppFonts } from './src/hooks/useFonts';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { CustomToast } from './src/components/CustomToast';
import { toastRef } from './src/utils/toast';
import { Colors } from './src/constants/colors';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const { fontsLoaded, fontError } = useAppFonts();
  const [splashHidden, setSplashHidden] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
        .catch(() => {})
        .finally(() => setSplashHidden(true));
    }
  }, [fontsLoaded, fontError]);

  // Failsafe: force-show after 4 s so a font hang never freezes the app
  useEffect(() => {
    const t = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
      setSplashHidden(true);
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  if (!splashHidden && !fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>

      {/* Global toast — sits above all navigation; fired via showToast() anywhere */}
      <CustomToast ref={toastRef} />
    </SafeAreaProvider>
  );
}
