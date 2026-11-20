import JavaScriptObfuscator from 'javascript-obfuscator';

const RESERVED_NAMES = [
   '^Capacitor$',
   '^CapacitorCustomPlatform$',
   '^CapacitorUtils$',
   '^androidBridge$',
   '^cordova$',
   '^webkit$',
   '^APP_DATA$',
   '^__cap',
];

const RESERVED_STRINGS = [
   'Capacitor',
   'CapacitorHttp',
   'PushNotifications',
   'SplashScreen',
   'Preferences',
   'SecureStorage',
   'Camera',
   'Filesystem',
   'Share',
   'Browser',
   'AppLauncher',
   'FileOpener',
   'App',
   'androidBridge',
   'capacitor://localhost',
   'https://localhost',
];

const OBFUSCATOR_OPTIONS = {
   compact: true,
   target: 'browser',
   sourceMap: false,

   controlFlowFlattening: false,
   deadCodeInjection: false,
   debugProtection: false,
   disableConsoleOutput: false,
   selfDefending: false,

   identifierNamesGenerator: 'mangled-shuffled',
   renameGlobals: false,
   renameProperties: false,
   transformObjectKeys: false,
   reservedNames: RESERVED_NAMES,

   numbersToExpressions: true,
   simplify: true,

   stringArray: true,
   stringArrayThreshold: 1,
   stringArrayEncoding: ['base64'],
   stringArrayIndexShift: true,
   stringArrayRotate: true,
   stringArrayShuffle: true,
   stringArrayWrappersCount: 2,
   stringArrayWrappersChainedCalls: true,
   stringArrayWrappersType: 'function',
   splitStrings: false,
   splitStringsChunkLength: 12,
   reservedStrings: RESERVED_STRINGS,

   unicodeEscapeSequence: false,
   log: false,
};

function hasOwnSources(chunk) {
   return Object.keys(chunk.modules || {}).some(
      (id) => !id.includes('node_modules'),
   );
}

export function obfuscateAppCode({ verbose = false } = {}) {
   return {
      name: 'obfuscate-app-code',
      apply: 'build',
      enforce: 'post',
      renderChunk(code, chunk) {
         if (!chunk.fileName.endsWith('.js')) {
            return null;
         }

         if (!chunk.isEntry || !hasOwnSources(chunk)) {
            return null;
         }

         const result = JavaScriptObfuscator.obfuscate(
            code,
            OBFUSCATOR_OPTIONS,
         );
         const obfuscated = result.getObfuscatedCode();

         if (verbose) {
            this.info(
               `obfuscate-app-code: ${chunk.fileName} ${Math.round(
                  code.length / 1024,
               )}kB -> ${Math.round(obfuscated.length / 1024)}kB`,
            );
         }

         return { code: obfuscated, map: null };
      },
   };
}
