import { App } from '@capacitor/app';

export async function getCurrentAppInfo() {
   return App.getInfo();
}
