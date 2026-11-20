import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { obfuscateAppCode } from './vite-plugins/obfuscate.plugin';
import { stripMocks } from './vite-plugins/strip-mocks.plugin';

const API_BASE_URLS = {
   prod: 'https://customer.360logistics.kz/wp-json/',
   dev: 'https://customer.360logistics.kz/staging/wp-json/',
};

export default defineConfig(({ mode }) => {
   const buildTarget =
      process.env.npm_config_buildtarget === 'dev' ? 'dev' : 'prod';

   const isHardened = mode !== 'staging';

   return {
      plugins: [
         react(),
         stripMocks({ verbose: true }),
         ...(isHardened ? [obfuscateAppCode({ verbose: true })] : []),
      ],
      base: './',
      publicDir: false,
      define: {
         'import.meta.env.VITE_API_MODE': JSON.stringify('api'),
         'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
            API_BASE_URLS[buildTarget],
         ),
      },
      esbuild: {
         ...(isHardened ? { drop: ['console', 'debugger'] } : {}),
         legalComments: 'none',
      },
      build: {
         outDir: 'dist-app',
         emptyOutDir: true,
         cssCodeSplit: false,
         chunkSizeWarningLimit: 4096,
         minify: isHardened ? 'terser' : 'esbuild',
         terserOptions: {
            compress: {
               drop_console: true,
               drop_debugger: true,
               pure_funcs: ['console.log', 'console.info', 'console.debug'],
            },
            format: { comments: false },
         },
         sourcemap: false,
         reportCompressedSize: false,
         rollupOptions: {
            output: {
               manualChunks(id) {
                  return id.includes('node_modules') ? 'vendor' : undefined;
               },
            },
         },
      },
   };
});
