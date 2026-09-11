import { alpha, createTheme } from '@mui/material';

// Three-step radius scale, applied with intent rather than one blanket value:
// sm = small inline tiles (InfoBadge-style elements), md = buttons/inputs/small
// containers, lg = cards/dialogs/major containers. Status/id chips keep the
// existing full-pill shape, set directly on MuiChip below.
const RADIUS = {
   sm: 6,
   md: 8,
   lg: 12,
};

// Two shadow tokens only, both keyed to Ink rather than pure black or a
// brand-tinted blue.
const SHADOW = {
   resting: '0 1px 2px rgba(22,36,62,0.06)',
   hover: '0 4px 16px rgba(22,36,62,0.10)',
};

export const theme = createTheme({
   // Custom, non-MUI-standard tokens exposed on the theme for future
   // components to reuse instead of inlining their own radius/shadow values.
   radius: RADIUS,
   customShadows: SHADOW,

   palette: {
      mode: 'light',
      primary: {
         main: '#1857C4', // Signal Blue — primary CTAs, links, active states, selected rows
      },
      background: {
         default: '#F6F7FA', // Canvas
         paper: '#FFFFFF',
      },
      text: {
         primary: '#16243E', // Ink
         secondary: '#526079', // Slate
      },
      divider: '#E2E6EE', // Border — single consistent hairline color
      success: {
         main: '#1D8A5E', // Success / Completed / Paid
      },
      error: {
         main: '#C24A2E', // Attention / Overdue / Cancelled
      },
   },

   shape: {
      borderRadius: RADIUS.md,
   },

   typography: {
      // Font family intentionally left at the MUI/Roboto default.
      // textTransform: 'none' is set explicitly on every variant below as a
      // belt-and-suspenders guard — MUI's own Typography variants don't
      // default to uppercase (only MuiButton does), so this shouldn't change
      // behavior, but it removes any ambiguity for anyone re-checking why a
      // heading isn't uppercase later.
      h1: { fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', textTransform: 'none' },
      h2: { fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', textTransform: 'none' },
      h3: { fontSize: 24, fontWeight: 600, letterSpacing: '-0.015em', textTransform: 'none' },
      h4: { fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', textTransform: 'none' },
      h5: { fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', textTransform: 'none' },
      // Page title — matches the existing variant="h6" fontWeight={600}
      // convention already used across list pages.
      h6: { fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', textTransform: 'none' },
      // Section title (e.g. detail-modal section headers).
      subtitle1: { fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em', textTransform: 'none' },
      subtitle2: { fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em', textTransform: 'none' },
      body1: { fontSize: 14, fontWeight: 400, textTransform: 'none' },
      body2: { fontSize: 13, fontWeight: 400, textTransform: 'none' },
      // Meta / caption text.
      caption: { fontSize: 12.5, fontWeight: 500, textTransform: 'none' },
      button: { textTransform: 'none', fontWeight: 600 },
      // Reusable style object for numeric/data display (prices, weights,
      // dates, IDs) — spread into an sx prop, e.g.
      // sx={{ ...theme.typography.tabularNums }}, rather than hardcoding
      // font-variant-numeric per component.
      tabularNums: {
         fontVariantNumeric: 'tabular-nums',
         fontFeatureSettings: '"tnum"',
      },
   },

   components: {
      MuiTypography: {
         variants: [
            {
               // Data-emphasis text (prices, totals): usage
               // <Typography variant="dataEmphasis">.
               props: { variant: 'dataEmphasis' },
               style: {
                  fontSize: 14,
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  fontFeatureSettings: '"tnum"',
               },
            },
         ],
      },
      MuiButton: {
         styleOverrides: {
            root: {
               textTransform: 'none',
               borderRadius: RADIUS.md,
            },
         },
      },
      MuiChip: {
         styleOverrides: {
            root: {
               borderRadius: 999,
            },
         },
      },
      MuiPaper: {
         styleOverrides: {
            root: {
               borderRadius: RADIUS.lg,
            },
         },
      },
      MuiDialog: {
         styleOverrides: {
            paper: {
               borderRadius: RADIUS.lg,
            },
         },
      },
      // Every list table in the app (leads/tenders/factorings/forwarders) is
      // an independent DataGrid instance with no shared wrapper component —
      // styling it here once, at the theme level, covers all of them (and
      // any future one) instead of repeating sx overrides per file.
      // Horizontal row dividers only (no vertical column lines): column
      // separation comes from cell padding/alignment, not grid rules.
      MuiDataGrid: {
         styleOverrides: {
            root: ({ theme }) => ({
               border: 0,
               '--DataGrid-rowBorderColor': theme.palette.divider,
            }),
            columnHeaders: ({ theme }) => ({
               backgroundColor: alpha(theme.palette.divider, 0.35),
               borderBottom: `1px solid ${theme.palette.divider}`,
               // Not `:first-of-type` — MUI X renders a structural spacer
               // <div> ahead of the first real header (for horizontal-scroll
               // offset) when no column is pinned, so the first header is
               // never actually first-of-type among its siblings. Every
               // header carries `aria-colindex` reflecting its real column
               // position (1-indexed), which is immune to that spacer.
               '& .MuiDataGrid-columnHeader[aria-colindex="1"]': {
                  paddingLeft: 32,
               },
            }),
            columnHeaderTitle: ({ theme }) => ({
               fontWeight: 600,
               color: theme.palette.text.primary,
            }),
            columnSeparator: {
               display: 'none',
            },
            cell: ({ theme }) => ({
               borderBottom: `1px solid ${theme.palette.divider}`,
               borderRight: 'none',
               '&:focus, &:focus-within': {
                  outline: 'none',
               },
               // Not `:first-of-type` — MUI X renders a structural
               // "cellOffsetLeft" spacer <div> immediately before the first
               // real cell in every row (for horizontal-scroll offset) when
               // no column is pinned, so the first cell is never actually
               // first-of-type among its row siblings and the rule silently
               // never matched. `aria-colindex="1"` targets the cell by its
               // real column position instead, which the spacer doesn't have.
               '&[aria-colindex="1"]': {
                  paddingLeft: 32,
               },
            }),
            row: ({ theme }) => ({
               // Zebra-striping: odd rows get a clearly-visible tint (still
               // a touch below the header's 0.35 so the header reads as the
               // most prominent band). Declared before the hover rule so
               // hover (same selector specificity) always wins the cascade.
               // Hover's own alpha is bumped up to stay visually distinct
               // now that the stripe itself is much stronger.
               // Targets a `row-odd` class applied via each table's
               // `getRowClassName` prop, NOT MUI X's own class list — this
               // installed version (^9.9.0) has no automatic
               // `MuiDataGrid-row--odd`/`--even` class (confirmed absent
               // from its gridClasses.js), so that selector never matched.
               '&.row-odd': {
                  backgroundColor: alpha(theme.palette.divider, 0.32),
               },
               '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
               },
            }),
         },
      },
   },
});
