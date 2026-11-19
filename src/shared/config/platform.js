import { Capacitor } from '@capacitor/core';

export function isNativePlatform() {
   return Capacitor.isNativePlatform();
}

export function getPlatform() {
   return Capacitor.getPlatform() || 'web';
}

export const isNative = isNativePlatform();
