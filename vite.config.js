import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_BASE_URLS = {
   prod: 'https://customer.360logistics.kz/wp-json/',
   dev: 'https://customer.360logistics.kz/staging/wp-json/',
};

export default defineConfig(({ command }) => {
   const buildTarget =
      process.env.npm_config_buildtarget === 'dev' ? 'dev' : 'prod';

   return {
      plugins: [react()],
      base: command === 'build' ? '/customer' : '/',
      define: {
         'process.env.NODE_ENV': JSON.stringify('production'),
         'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
            API_BASE_URLS[buildTarget],
         ),
      },
      build: {
         cssCodeSplit: false,
         lib: {
            entry: 'src/main.jsx',
            formats: ['iife'],
            name: 'CustomerApp',
            fileName: () => 'index.js',
            cssFileName: 'index',
         },
      },
   };
});
