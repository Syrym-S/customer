import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const DEBUG_CONSOLE_METHODS = ['console.log', 'console.info', 'console.debug'];

export default defineConfig(({ command, mode }) => {
   const isProduction = command === 'build' && mode === 'production';

   return {
      plugins: [react()],
      base: command === 'build' ? '/customer' : '/',
      define: command === 'build' ? {
         'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      } : {},
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
