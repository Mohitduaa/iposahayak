export default {
  expo: {
    name: "IPO Sahayak",
    slug: "IpoShayak",
    version: "1.2.6",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.iposahayak",
      googleServicesFile: "./GoogleService-Info.plist",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        UIBackgroundModes: ["remote-notification"]
      },
      runtimeVersion: "1.3.0"
    },
    android: {
      package: "com.iposahayak",
      runtimeVersion: "1.3.0",
      edgeToEdge: true,
      // expo-store-review reads this for its own fallback when the in-app
      // review sheet cannot be shown
      playStoreUrl: "https://play.google.com/store/apps/details?id=com.iposahayak",
      googleServicesFile: "./google-services.json"
    },
    web: {
      bundler: "metro",
      output: "single",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      // Sets the iOS "aps-environment" entitlement. EAS-built IPAs — even the
      // "development" build profile — are ad-hoc/distribution signed, not a
      // raw Xcode debug build, so they all need the production APNs
      // environment. Left as "development" here, every IPA silently failed
      // to receive OneSignal pushes on iOS: the entitlement said development,
      // the signing said otherwise, and iOS just dropped the registration.
      ["onesignal-expo-plugin", { mode: "production" }],
      "expo-router",
      "expo-font",
      "expo-web-browser",
      "@react-native-firebase/app",
      // Firebase's own SDKs are static frameworks; without this the iOS build
      // fails and the Android one links the wrong way round
      ["expo-build-properties", { ios: { useFrameworks: "static", deploymentTarget: "15.1" } }],
      // SDK 52 moved splash configuration onto this plugin; the old top-level
      // `splash` key below it was being ignored, which is why changing it never
      // changed anything. imageWidth is the piece the legacy key had no way to
      // express: without it a 512px source is scaled to fill whatever aspect
      // ratio the phone has, which is what made the logo look wrong on tall
      // screens.
      [
        "expo-splash-screen",
        {
          image: "./assets/images/icon.png",
          imageWidth: 180,
          resizeMode: "contain",
          backgroundColor: "#FFFFFF"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "ffa0ba5c-ce0d-4651-b603-5fd0b9587186"
      },
      oneSignalAppId: "96170c8b-bb38-41d0-a04e-79a09ead88a7",
      // "Continue with Google": the Web client ID from Firebase →
      // Authentication → Google (also the client_type 3 entry in
      // google-services.json). The backend's GOOGLE_SIGNIN_CLIENT_IDS must
      // hold the same value. Android needs the app's SHA-1 fingerprints
      // added under Firebase → Project settings; iOS additionally needs the
      // @react-native-google-signin config plugin with its iosUrlScheme.
      googleWebClientId: "754425793881-icleqotdtiddh85unvka4k6meeev76mj.apps.googleusercontent.com"
    },
    updates: {
      url: "https://u.expo.dev/23a7d416-3bb5-48c3-b8d2-0fba69ee12b0",
      runtimeVersion: "1.3.0"
    },
    owner: "mohit70",
    doctor: {
      skipNativeConfigSyncWarning: true
    }
  }
};
