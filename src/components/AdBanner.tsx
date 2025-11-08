import React from 'react';

interface AdBannerProps {
  screen?: 'home' | 'calendar' | 'statistics' | 'settings';
}

/**
 * AdBanner Component - Currently Disabled
 *
 * A non-intrusive banner ad component that respects user experience
 * and follows app store guidelines.
 *
 * To enable AdMob:
 * 1. Install: npx expo install react-native-google-mobile-ads
 * 2. Configure app.json with AdMob plugin
 * 3. Uncomment the code below and remove this placeholder
 *
 * Usage:
 * - Only use on non-critical screens (statistics, settings)
 * - Never use during data entry or sensitive operations
 * - Ads are automatically controlled by frequency capping
 */
const AdBanner: React.FC<AdBannerProps> = ({ screen = 'statistics' }) => {
  // Ads disabled - return null for now
  return null;

  // Uncomment below when AdMob is configured:
  /*
  import { View, StyleSheet } from 'react-native';
  import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
  import { AD_UNIT_IDS, canShowAd, recordAdImpression, DEFAULT_AD_CONFIG } from '../services/adsManager';

  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (!DEFAULT_AD_CONFIG.locations.includes(screen)) {
      setShouldShow(false);
      return;
    }

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
          requestNonPersonalizedAdsOnly: true,
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

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      paddingVertical: 8,
    },
  });
  */
};

export default AdBanner;
