import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const DEBUG_CONSOLE_METHODS = ['console.log', 'console.info', 'console.debug'];

const API_BASE_URLS = {
   prod: 'https://customer.360logistics.kz/wp-json/',
   dev: 'https://customer.360logistics.kz/staging/wp-json/',
};

export default defineConfig(({ command, mode }) => {
   const isProduction = command === 'build' && mode === 'production';
   const buildTarget =
      process.env.npm_config_buildtarget === 'dev' ? 'dev' : 'prod';

   return {
      plugins: [react()],
      base: command === 'build' ? '/customer' : '/',
      define: {
         ...(command === 'build'
            ? {
                 'process.env.NODE_ENV': JSON.stringify(
                    isProduction ? 'production' : 'development',
                 ),
              }
            : {}),
         'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
            API_BASE_URLS[buildTarget],
         ),
      },
      esbuild: {
         pure: isProduction ? DEBUG_CONSOLE_METHODS : [],
         drop: isProduction ? ['debugger'] : [],
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
