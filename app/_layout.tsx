import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { Colors } from '../constants/Theme';
import { StatusBar } from 'expo-status-bar';

import 'react-native-reanimated';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter: require('../assets/fonts/Inter-Regular.ttf'),
    Manrope: require('../assets/fonts/SpaceMono-Regular.ttf'), // Normally use actual Manrope font, fallback for now
    // If you run `npx expo install @expo-google-fonts/manrope`, you'd import it here ideally.
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </Provider>
  );
}
