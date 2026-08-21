import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Second, separate build for the public/unauthenticated shared-lead page
// (src/main-public.jsx) — kept as its own config file rather than adding a
// second entry to vite.config.js's build.lib.entry, because Vite's lib mode
// does not support multiple entries for 'iife'/'umd' formats (each needs its
// own single global `name`); an object-form entry there would either error
// or silently bundle both apps into one chunk. Two separate `vite build`
// invocations keep the outputs fully independent.
export default defineConfig(({ command }) => ({
   plugins: [react()],
   // Mirrors vite.config.js's base handling — see that file for why.
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
         // Deploy target is a flat js/shared/ dir on the FTP server, sibling
         // to js/workspace (see deploy.js) — not nested under "assets".
         fileName: () => 'shared/index.js',
         cssFileName: 'index',
      },
      // lib.cssFileName only sets the basename (no directory) of the
      // extracted CSS asset — it lands wherever assetFileNames says, at the
      // asset's own name. Point that at the same flat dist/shared/ dir as
      // the JS above (Vite lib mode has no single option that nests JS and
      // CSS together under one tree, so both are set explicitly here).
      rollupOptions: {
         output: {
            assetFileNames: 'shared/[name][extname]',
         },
      },
      // This build runs after the main vite.config.js build and writes into
      // the same dist/ folder (see deploy.js, which uploads dist/ as a
      // whole). Vite empties outDir by default, which would otherwise wipe
      // out the main build's index.js/index.css right before deploy.
      emptyOutDir: false,
   },
}));
