import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS, canShowAd, recordAdImpression, DEFAULT_AD_CONFIG } from '../services/adsManager';

interface AdBannerProps {
  screen?: 'home' | 'calendar' | 'statistics' | 'settings';
}

/**
 * AdBanner Component
 *
 * A non-intrusive banner ad component that respects user experience
 * and follows app store guidelines.
 *
 * Usage:
 * - Only use on non-critical screens (statistics, settings)
 * - Never use during data entry or sensitive operations
 * - Ads are automatically controlled by frequency capping
 */
const AdBanner: React.FC<AdBannerProps> = ({ screen = 'statistics' }) => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check if we should show ads for this screen
    if (!DEFAULT_AD_CONFIG.locations.includes(screen)) {
      setShouldShow(false);
      return;
    }

    // Check frequency capping
    if (!canShowAd(DEFAULT_AD_CONFIG)) {
      setShouldShow(false);
      return;
    }

    setShouldShow(true);
  }, [screen]);

  if (!shouldShow) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={AD_UNIT_IDS.BANNER}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true, // GDPR compliance
        }}
        onAdLoaded={() => {
          console.log('Banner ad loaded');
          recordAdImpression();
        }}
        onAdFailedToLoad={(error) => {
          console.log('Banner ad failed to load:', error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 8,
  },
});

export default AdBanner;
