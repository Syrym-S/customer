import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

import { isNative } from '../config/platform';

const CAMERA_QUALITY = 90;

export function isCameraAvailable() {
   return isNative;
}

function resolveFileName(photo) {
   const format = String(photo?.format || 'jpeg').toLowerCase();

   return `photo-${Date.now()}.${format === 'jpg' ? 'jpeg' : format}`;
}

export async function takePhotoFile() {
   if (!isCameraAvailable()) {
      return null;
   }

   const photo = await Camera.getPhoto({
      quality: CAMERA_QUALITY,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      allowEditing: false,
      correctOrientation: true,
   });

   const uri = photo?.webPath || photo?.path;

   if (!uri) {
      return null;
   }

   const response = await fetch(uri);
   const blob = await response.blob();

   return new File([blob], resolveFileName(photo), {
      type: blob.type || `image/${photo.format || 'jpeg'}`,
   });
}
