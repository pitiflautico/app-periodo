import mobileAds, {
  MaxAdContentRating,
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';

// Initialize Google Mobile Ads
export const initializeAds = async () => {
  try {
    await mobileAds().initialize();

    // Configure ads for compliance with Google Play policies
    await mobileAds().setRequestConfiguration({
      // Set max ad content rating to ensure appropriate ads
      maxAdContentRating: MaxAdContentRating.G,
      // Tag for child-directed treatment (COPPA compliance)
      tagForChildDirectedTreatment: false,
      // Tag for under age of consent
      tagForUnderAgeOfConsent: false,
    });

    console.log('Google Mobile Ads initialized');
  } catch (error) {
    console.error('Error initializing ads:', error);
  }
};

// Ad Unit IDs - Using test IDs for development
// IMPORTANT: Replace with your actual Ad Unit IDs before publishing
export const AD_UNIT_IDS = {
  // Test IDs provided by Google
  BANNER: __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy',
  INTERSTITIAL: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy',
};

/**
 * Strategy for ads placement to ensure app store approval:
 *
 * 1. BANNER ADS (Recommended):
 *    - Place at the bottom of non-critical screens only
 *    - Never on onboarding or data entry screens
 *    - Good locations: Statistics screen, Settings screen
 *    - Keep banners small and non-intrusive
 *
 * 2. INTERSTITIAL ADS (Use sparingly):
 *    - Only show after significant user actions
 *    - Never interrupt data entry or critical flows
 *    - Recommended: After viewing statistics, after completing onboarding
 *    - Implement frequency capping (max 1-2 per session)
 *
 * 3. COMPLIANCE GUIDELINES:
 *    - Never show ads on screens with sensitive health data entry
 *    - No ads during period logging or symptom tracking
 *    - Respect user experience - ads should not interfere with core functionality
 *    - Follow GDPR and privacy regulations
 *    - Ensure ads are health-appropriate (using MaxAdContentRating.G)
 *
 * 4. BEST PRACTICES FOR APP STORE APPROVAL:
 *    - iOS: Comply with App Store Review Guidelines 4.2 (Minimum Functionality)
 *    - Android: Follow Google Play's User Data and Ads policies
 *    - Make ads optional or provide premium ad-free version
 *    - Never force users to watch ads to access core health features
 *    - Be transparent about ad usage in privacy policy
 */

export interface AdConfig {
  enabled: boolean;
  frequency: 'low' | 'medium' | 'high';
  locations: ('home' | 'calendar' | 'statistics' | 'settings')[];
}

// Default ad configuration (conservative approach)
export const DEFAULT_AD_CONFIG: AdConfig = {
  enabled: true,
  frequency: 'low', // Show ads sparingly
  locations: ['statistics', 'settings'], // Only on non-critical screens
};

// Track ad impressions to implement frequency capping
let adImpressions = 0;
let lastAdTimestamp = 0;

export const canShowAd = (config: AdConfig = DEFAULT_AD_CONFIG): boolean => {
  if (!config.enabled) return false;

  const now = Date.now();
  const timeSinceLastAd = now - lastAdTimestamp;

  // Implement frequency capping based on config
  const minTimeBetweenAds = {
    low: 5 * 60 * 1000, // 5 minutes
    medium: 3 * 60 * 1000, // 3 minutes
    high: 1 * 60 * 1000, // 1 minute
  };

  const maxAdsPerSession = {
    low: 3,
    medium: 6,
    high: 10,
  };

  if (timeSinceLastAd < minTimeBetweenAds[config.frequency]) {
    return false;
  }

  if (adImpressions >= maxAdsPerSession[config.frequency]) {
    return false;
  }

  return true;
};

export const recordAdImpression = () => {
  adImpressions++;
  lastAdTimestamp = Date.now();
};

export const resetAdSession = () => {
  adImpressions = 0;
  lastAdTimestamp = 0;
};
