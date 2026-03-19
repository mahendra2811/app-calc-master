export default ({ config }) => ({
  ...config,
  name: "CalcMaster",
  slug: "calcmaster",
  version: "1.0.0",
  orientation: "default",
  icon: "./assets/images/icon.png",
  scheme: "calcmaster",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,

  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#111827",
  },

  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.calcmaster.app",
    infoPlist: {
      NSUserTrackingUsageDescription:
        "This allows CalcMaster to provide personalized ads. You can opt out anytime.",
    },
    ...(process.env.EXPO_PUBLIC_FIREBASE_ENABLED === "true" && {
      googleServicesFile: "./assets/google-services/GoogleService-Info.plist",
    }),
  },

  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#111827",
    },
    package: "com.calcmaster.app",
    versionCode: 1,
    minSdkVersion: 24,
    compileSdkVersion: 35,
    targetSdkVersion: 35,
    ...(process.env.EXPO_PUBLIC_FIREBASE_ENABLED === "true" && {
      googleServicesFile: "./assets/google-services.json",
    }),
  },

  plugins: [
    "expo-router",
    "expo-localization",
    "expo-haptics",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
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
        },
        ios: {
          deploymentTarget: "15.1",
          useFrameworks: "static",
        },
      },
    ],
    ...(process.env.EXPO_PUBLIC_ADS_ENABLED === "true"
      ? [
          [
            "react-native-google-mobile-ads",
            {
              androidAppId:
                process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID ||
                "ca-app-pub-0000000000000000~0000000000",
              iosAppId:
                process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID ||
                "ca-app-pub-0000000000000000~0000000000",
            },
          ],
        ]
      : []),
    ...(process.env.EXPO_PUBLIC_FIREBASE_ENABLED === "true"
      ? ["@react-native-firebase/app", "@react-native-firebase/analytics"]
      : []),
  ],

  experiments: {
    typedRoutes: true,
  },

  extra: {
    adsEnabled: process.env.EXPO_PUBLIC_ADS_ENABLED === "true",
    analyticsEnabled: process.env.EXPO_PUBLIC_ANALYTICS_ENABLED === "true",
    eas: {
      projectId: "your-project-id-here",
    },
  },
});
