// This installed @mui/x-data-grid version has no automatic odd/even row
// class (see theme.js's MuiDataGrid.row override), so zebra-striping needs
// an explicit `getRowClassName` on every table — shared here so all 4
// tables stay in sync with the class name the theme targets.
export function getZebraRowClassName(params) {
   return params.indexRelativeToCurrentPage % 2 === 1 ? 'row-odd' : '';
}

// Shortens a long id like "a1b2c3d4-e5f6-..." to "a1b2c3…e5f6" so an ID
// column doesn't need to fit the whole string — pair with a Tooltip showing
// the full value.
export function truncateId(id, headLength = 6, tailLength = 4) {
   const value = String(id ?? '');

   if (value.length <= headLength + tailLength + 1) {
      return value;
   }

   return `${value.slice(0, headLength)}…${value.slice(-tailLength)}`;
}

// City/region-only version of a location for compact columns — pair with a
// Tooltip showing the full address (e.g. via the widget's own
// getLocationLabel).
export function getShortLocationLabel(location, fullLabel) {
   if (!location || typeof location !== 'object') {
      return fullLabel;
   }

   const parts = [location.city, location.region].filter(Boolean);

   return parts.length ? parts.join(', ') : fullLabel;
}
