import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
   plugins: [react()],
   base: '/customer',
   define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
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
});