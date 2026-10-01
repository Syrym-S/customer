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

export function toNumberOrNull(value) {
   if (value === null || value === undefined) {
      return null;
   }

   if (typeof value === 'string' && value.trim() === '') {
      return null;
   }

   const number = Number(value);

   return Number.isFinite(number) ? number : null;
}

export function toSortString(value, ...placeholders) {
   const text = String(value ?? '').trim();

   return placeholders.includes(text) ? '' : text;
}

function parseDateText(raw, timezone) {
   if (typeof raw !== 'string') {
      return null;
   }

   let text = raw
      .trim()
      .replace(' ', 'T')
      .replace(/(\.\d{3})\d+/, '$1');

   if (!text) {
      return null;
   }

   if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      text = `${text}T00:00:00`;
   }

   const hasZone = /(Z|[+-]\d{2}:?\d{2})$/i.test(text);
   const isUtc = !timezone || timezone === 'UTC';
   const time = new Date(hasZone || !isUtc ? text : `${text}Z`).getTime();

   return Number.isNaN(time) ? null : time;
}

export function toTimestamp(value) {
   if (value === null || value === undefined || value === '') {
      return null;
   }

   if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
   }

   if (value instanceof Date) {
      const time = value.getTime();

      return Number.isNaN(time) ? null : time;
   }

   if (typeof value === 'object') {
      return parseDateText(value.date, value.timezone);
   }

   return parseDateText(value);
}
