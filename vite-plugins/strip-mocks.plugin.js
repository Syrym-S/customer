const MOCK_MODULE_PATTERN = /[\\/]src[\\/].+\.mock(-api)?\.js$/;

const KEEP_PATTERNS = [/[\\/]chat\.mock\.js$/];

const NAMED_EXPORT_PATTERN =
   /^[ \t]*export[ \t]+(?:async[ \t]+)?(?:function[ \t*]+|const[ \t]+|let[ \t]+|var[ \t]+|class[ \t]+)([A-Za-z_$][\w$]*)/gm;

const EXPORT_LIST_PATTERN = /^[ \t]*export[ \t]*\{([^}]*)\}[ \t]*;?[ \t]*$/gm;

const DEFAULT_EXPORT_PATTERN = /^[ \t]*export[ \t]+default\b/m;

function collectExportNames(code) {
   const names = new Set();

   for (const match of code.matchAll(NAMED_EXPORT_PATTERN)) {
      names.add(match[1]);
   }

   for (const match of code.matchAll(EXPORT_LIST_PATTERN)) {
      for (const entry of match[1].split(',')) {
         const parts = entry.trim().split(/\s+as\s+/);
         const exported = (parts[1] || parts[0] || '').trim();

         if (exported && exported !== 'default') {
            names.add(exported);
         }
      }
   }

   return [...names];
}

export function stripMocks({ verbose = false } = {}) {
   const stubbed = [];

   return {
      name: 'strip-mocks',
      apply: 'build',
      enforce: 'pre',
      transform(code, id) {
         const normalized = id.split('?')[0];

         if (!MOCK_MODULE_PATTERN.test(normalized)) {
            return null;
         }

         if (KEEP_PATTERNS.some((pattern) => pattern.test(normalized))) {
            return null;
         }

         const names = collectExportNames(code);

         if (!names.length) {
            this.warn(
               `strip-mocks: no exports parsed in ${normalized}, module left intact`,
            );

            return null;
         }

         stubbed.push(normalized);

         const body = names
            .map((name) => `export const ${name} = void 0;`)
            .join('\n');

         const fallback = DEFAULT_EXPORT_PATTERN.test(code)
            ? '\nexport default void 0;'
            : '';

         return { code: `${body}${fallback}\n`, map: null };
      },
      buildEnd() {
         if (verbose) {
            this.info(`strip-mocks: stubbed ${stubbed.length} mock modules`);
         }
      },
   };
}
