import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useAppFonts } from './src/hooks/useFonts';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Colors } from './src/constants/colors';

// Keep the splash screen visible while fonts load
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const { fontsLoaded, fontError } = useAppFonts();
  const [splashHidden, setSplashHidden] = useState(false);

  useEffect(() => {
    // Hide splash once fonts are ready (or failed — fall back to system fonts)
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
        .catch(() => {})
        .finally(() => setSplashHidden(true));
    }
  }, [fontsLoaded, fontError]);

  // Safety net: if fonts hang for > 4 seconds, force-show the app anyway
  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
      setSplashHidden(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Block render until splash is ready to hide to prevent flash
  if (!splashHidden && !fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return <AppNavigator />;
}
