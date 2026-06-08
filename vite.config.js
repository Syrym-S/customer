import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
   plugins: [react()],
   build: {
      rollupOptions: {
         input: {
            index: resolve(__dirname, 'src/main.jsx'),
         },
         output: {
            entryFileNames: 'index.js',
            assetFileNames: (assetInfo) => {
               if (assetInfo.name?.endsWith('.css')) {
                  return 'index.css';
               }

               return 'assets/[name][extname]';
            },
         },
      },
   },
});
