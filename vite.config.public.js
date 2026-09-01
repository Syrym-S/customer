import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
   plugins: [react()],
   base: command === 'build' ? '/customer' : '/',
   define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
   },
   build: {
      cssCodeSplit: false,
      lib: {
         entry: 'src/main-public.jsx',
         formats: ['iife'],
         name: 'CustomerPublicApp',
         fileName: () => 'shared/index.js',
         cssFileName: 'index',
      },
      rollupOptions: {
         output: {
            assetFileNames: 'shared/[name][extname]',
         },
      },
      emptyOutDir: false,
   },
}));
