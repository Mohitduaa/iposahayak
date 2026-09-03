export default {
  expo: {
    name: "IpoShayak",
    slug: "IpoShayak",
    version: "1.2.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.iposahayak",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        UIBackgroundModes: ["remote-notification"]
      },
      runtimeVersion: "1.2.0"
    },
    android: {
      package: "com.iposahayak",
      runtimeVersion: "1.2.0",
      edgeToEdge: true,
      // expo-store-review reads this for its own fallback when the in-app
      // review sheet cannot be shown
      playStoreUrl: "https://play.google.com/store/apps/details?id=com.iposahayak"
    },
    web: {
      bundler: "metro",
      output: "single",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      ["onesignal-expo-plugin", { mode: "development" }],
      "expo-router",
      "expo-font",
      "expo-web-browser"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "23a7d416-3bb5-48c3-b8d2-0fba69ee12b0"
      },
      oneSignalAppId: "96170c8b-bb38-41d0-a04e-79a09ead88a7"
    },
    updates: {
      url: "https://u.expo.dev/23a7d416-3bb5-48c3-b8d2-0fba69ee12b0",
      runtimeVersion: "1.2.0"
    },
    owner: "mohit70",
    splash: {
      image: "./assets/images/icon.png",
      resizeMode: "contain",
      backgroundColor: "#0F172A"
    },
    doctor: {
      skipNativeConfigSyncWarning: true
    }
  }
};
