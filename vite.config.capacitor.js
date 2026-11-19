import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_BASE_URLS = {
   prod: 'https://customer.360logistics.kz/wp-json/',
   dev: 'https://customer.360logistics.kz/staging/wp-json/',
};

export default defineConfig(() => {
   const buildTarget =
      process.env.npm_config_buildtarget === 'dev' ? 'dev' : 'prod';

   return {
      plugins: [react()],
      base: './',
      publicDir: false,
      define: {
         'import.meta.env.VITE_API_MODE': JSON.stringify('api'),
         'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
            API_BASE_URLS[buildTarget],
         ),
      },
      build: {
         outDir: 'dist-app',
         emptyOutDir: true,
         cssCodeSplit: false,
         chunkSizeWarningLimit: 4096,
      },
   };
});
