import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { FileOpener } from '@capacitor-community/file-opener';

import { isNative } from '../config/platform';

function saveWithAnchor(blob, fileName) {
   const objectUrl = URL.createObjectURL(blob);
   const link = document.createElement('a');

   link.href = objectUrl;
   link.download = fileName || '';
   document.body.appendChild(link);
   link.click();
   link.remove();
   URL.revokeObjectURL(objectUrl);
}

function blobToBase64(blob) {
   return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
         const result = String(reader.result || '');
         const commaIndex = result.indexOf(',');

         resolve(commaIndex === -1 ? result : result.slice(commaIndex + 1));
      };

      reader.readAsDataURL(blob);
   });
}

function sanitizeFileName(fileName) {
   const name = String(fileName || '')
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '_');

   return name || `file-${Date.now()}`;
}

async function shareFileUri(uri, title) {
   try {
      await Share.share({ title, url: uri, files: [uri] });

      return true;
   } catch {
      return false;
   }
}

async function saveNative(blob, fileName) {
   const path = sanitizeFileName(fileName);
   const data = await blobToBase64(blob);

   const written = await Filesystem.writeFile({
      path,
      data,
      directory: Directory.Cache,
      recursive: true,
   });

   const uri = written?.uri;

   if (!uri) {
      return false;
   }

   try {
      await FileOpener.open({
         filePath: uri,
         contentType: blob.type || undefined,
      });

      return true;
   } catch {
      return shareFileUri(uri, path);
   }
}

export async function saveBlobAsFile(blob, fileName = '') {
   if (!blob) {
      return false;
   }

   if (isNative) {
      try {
         if (await saveNative(blob, fileName)) {
            return true;
         }
      } catch {
         saveWithAnchor(blob, fileName);

         return false;
      }
   }

   saveWithAnchor(blob, fileName);

   return !isNative;
}

export async function saveFileFromUrl(url, fileName = '') {
   if (!url) {
      return false;
   }

   const response = await fetch(url);

   return saveBlobAsFile(await response.blob(), fileName);
}

export function createFileBlob(bytes, mimeType) {
   return new Blob([bytes], {
      type: mimeType || 'application/octet-stream',
   });
}
