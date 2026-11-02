import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';

export function createEmotionCache(direction) {
   return direction === 'rtl'
      ? createCache({ key: 'mui-rtl', stylisPlugins: [prefixer, rtlPlugin] })
      : createCache({ key: 'mui' });
}
