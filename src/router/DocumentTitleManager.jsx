import { useEffect } from 'react';
import { useMatches } from 'react-router-dom';
import { useTitleStore } from '../shared/model/title.store';

const BRAND = '360Logistics';

// Побеждает самый глубокий совпавший роут с handle.title — то же правило,
// что в AppBreadcrumbs.jsx для handle.breadcrumb, так что дочерний роут
// может переопределить заголовок родителя.
function resolveRouteTitle(matches) {
   for (let i = matches.length - 1; i >= 0; i--) {
      const { handle } = matches[i];
      if (!handle?.title) continue;

      return typeof handle.title === 'function' ? handle.title(matches[i]) : handle.title;
   }

   return null;
}

export function DocumentTitleManager() {
   const matches = useMatches();
   const segments = useTitleStore((state) => state.segments);
   const routeTitle = resolveRouteTitle(matches);

   useEffect(() => {
      const extraSegments = Object.values(segments)
         .sort((a, b) => a.order - b.order)
         .map((segment) => segment.label);

      document.title = [routeTitle, ...extraSegments, BRAND].filter(Boolean).join(' | ');
   }, [routeTitle, segments]);

   return null;
}
