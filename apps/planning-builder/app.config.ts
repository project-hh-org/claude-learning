import type { ConfigContext, ExpoConfig } from 'expo/config';

type AppEnv = 'development' | 'preview' | 'production';

const APP_ENV = (process.env.APP_ENV as AppEnv) ?? 'development';

const variants: Record<AppEnv, { name: string; bundleId: string; scheme: string; icon: string }> = {
  development: {
    name: 'AI Planner (Dev)',
    bundleId: 'com.example.aiplanner.dev',
    scheme: 'aiplanner-dev',
    icon: './assets/icon.png',
  },
  preview: {
    name: 'AI Planner (Preview)',
    bundleId: 'com.example.aiplanner.preview',
    scheme: 'aiplanner-preview',
    icon: './assets/icon.png',
  },
  production: {
    name: 'AI Planner',
    bundleId: 'com.example.aiplanner',
    scheme: 'aiplanner',
    icon: './assets/icon.png',
  },
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const v = variants[APP_ENV];

  return {
    ...config,
    name: v.name,
    slug: 'ai-planning-builder',
    version: '0.1.0',
    orientation: 'portrait',
    icon: v.icon,
    scheme: v.scheme,
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      bundleIdentifier: v.bundleId,
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription:
          'This app uses the camera to let you take photos for your profile.',
        NSPhotoLibraryUsageDescription: 'This app accesses your photos to let you share images.',
        NSMicrophoneUsageDescription: 'This app uses the microphone for voice features.',
        NSLocationWhenInUseUsageDescription:
          'This app uses your location to provide nearby content.',
      },
      privacyManifests: {
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults',
            NSPrivacyAccessedAPITypeReasons: ['CA92.1'],
          },
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp',
            NSPrivacyAccessedAPITypeReasons: ['C617.1'],
          },
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategorySystemBootTime',
            NSPrivacyAccessedAPITypeReasons: ['35F9.1'],
          },
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryDiskSpace',
            NSPrivacyAccessedAPITypeReasons: ['E174.1'],
          },
        ],
      },
    },
    android: {
      package: v.bundleId,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      permissions: ['INTERNET', 'ACCESS_NETWORK_STATE', 'POST_NOTIFICATIONS', 'VIBRATE'],
    },
    web: {
      bundler: 'metro',
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-localization',
      [
        'expo-splash-screen',
        {
          image: './assets/splash.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#ffffff',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      tsconfigPaths: true,
    },
    extra: {
      appEnv: APP_ENV,
      eas: {
        projectId: 'YOUR-EAS-PROJECT-ID',
      },
    },
    updates: {
      url: 'https://u.expo.dev/YOUR-EAS-PROJECT-ID',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
  };
};
