import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
   plugins: [react()],
   // Production/staging deploy is a plain file copy of `dist` onto a
   // WordPress asset path (see deploy.js) that always resolves as
   // `/customer/...`, so the build must keep base: '/customer'.
   // The local dev server has no such asset path — forcing the same
   // prefix there just makes Vite itself 404 anything outside
   // `/customer/*` before React Router ever sees the request (router.jsx's
   // own basename/path config has no "/customer" segment outside routes
   // nested under the authenticated tree). Dev-only base of '/' lets the
   // app run at the router's actual root instead.
   base: command === 'build' ? '/customer' : '/',
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
}));