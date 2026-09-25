import React, { useState } from 'react';
import { View, Platform } from 'react-native';

// The banner shown at the bottom of busy screens. The native AdMob module is
// missing on web and in any dev client built without it, so everything is
// loaded lazily and a failure renders nothing — an ad must never take the
// screen down with it.
//
// Ad unit ids: Google's official test units in development; the real units
// (create them in the AdMob console under each app, then paste here) in a
// release build.
const PROD_UNITS = {
  android: 'ca-app-pub-5670091853008171/REPLACE_WITH_ANDROID_BANNER_UNIT',
  ios: 'ca-app-pub-5670091853008171/REPLACE_WITH_IOS_BANNER_UNIT',
};

let ads: any = null;
let initialised = false;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ads = require('react-native-google-mobile-ads');
  if (!initialised && ads?.default) {
    initialised = true;
    ads.default().initialize().catch(() => {});
  }
} catch {
  ads = null;
}

export function AdBanner() {
  const [failed, setFailed] = useState(false);

  if (!ads?.BannerAd || Platform.OS === 'web' || failed) return null;

  const { BannerAd, BannerAdSize, TestIds } = ads;
  const unitId = __DEV__
    ? TestIds.ADAPTIVE_BANNER
    : Platform.OS === 'ios'
      ? PROD_UNITS.ios
      : PROD_UNITS.android;

  // A unit id that is still the placeholder must not reach AdMob.
  if (!__DEV__ && unitId.includes('REPLACE_WITH')) return null;

  return (
    <View style={{ alignItems: 'center' }}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}
