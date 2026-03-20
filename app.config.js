export default ({ config }) => ({
  ...config,
  name: "CalcMaster",
  slug: "calcmaster",
  version: "1.0.1",
  orientation: "default",
  icon: "./assets/icon.png",
  scheme: "calcmaster",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,

  cli: {
    appVersionSource: "remote",
  },

  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#111827",
  },

  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.calcmaster.app",
  },

  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      backgroundColor: "#111827",
    },
    package: "com.calcmaster.app",
    versionCode: 2,
    minSdkVersion: 24,
    compileSdkVersion: 35,
    targetSdkVersion: 35,
  },

  plugins: [
    "expo-router",
    "expo-localization",
    [
      "expo-splash-screen",
      {
        image: "./assets/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#111827",
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          minSdkVersion: 24,
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          enableProguardInReleaseBuilds: true,
          enableShrinkResourcesInReleaseBuilds: true,
          useLegacyPackaging: false,
          packagingOptions: {
            pickFirst: [
              "**/libc++_shared.so",
              "**/libfbjni.so",
            ],
          },
        },
        ios: {
          deploymentTarget: "15.1",
          useFrameworks: "static",
        },
      },
    ],

    // Phase 2: AdMob + Firebase plugins — add when credentials are ready
    // ["react-native-google-mobile-ads", { androidAppId: "...", iosAppId: "..." }],
    // "@react-native-firebase/app",
    // "@react-native-firebase/analytics",
  ],

  experiments: {
    typedRoutes: false,
  },

  extra: {
    adsEnabled: process.env.EXPO_PUBLIC_ADS_ENABLED === "true",
    analyticsEnabled: process.env.EXPO_PUBLIC_ANALYTICS_ENABLED === "true",
    eas: {
      projectId: "ee5c99cc-d923-468a-8d39-51e2e77a99ff",
    },
  },
});
