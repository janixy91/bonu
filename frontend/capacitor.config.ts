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
  },
};

export default config;

