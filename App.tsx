import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants/colors';
import { isOnboardingCompleted } from './src/services/storage';
// import { initializeAds } from './src/services/adsManager'; // Commented out - AdMob not yet configured

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<'Onboarding' | 'Main'>('Onboarding');

  useEffect(() => {
    prepareApp();
  }, []);

  const prepareApp = async () => {
    try {
      // Initialize ads
      // await initializeAds(); // Commented out - AdMob not yet configured

      // Check if onboarding is completed
      const completed = await isOnboardingCompleted();
      setInitialRoute(completed ? 'Main' : 'Onboarding');
    } catch (error) {
      console.error('Error preparing app:', error);
    } finally {
      setIsReady(true);
    }
  };

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
