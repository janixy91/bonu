import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bonu.app',
  appName: 'BONU',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    Camera: {
      permissions: {
        camera: 'This app uses your camera to scan QR codes',
      },
    },
    App: {
      // Deep link configuration
      // iOS: Configure in Xcode project settings
      // Android: Configure in AndroidManifest.xml (auto-generated)
    },
  },
};

export default config;

