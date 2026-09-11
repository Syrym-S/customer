// Pure presentation translation, not a color-mapping decision: Factorings'
// getFactoringStatusColor/getVerificationColor return short MUI Chip
// `color` keys ('success' | 'error' | ...) rather than a theme color path,
// since they were written for the `color` prop on <Chip>. StatusDot takes a
// literal color path instead, so this only reshapes the same value into the
// form it needs — it doesn't decide which color any status gets.
const PALETTE_KEY_TO_COLOR_PATH = {
   primary: 'primary.main',
   success: 'success.main',
   error: 'error.main',
   warning: 'warning.main',
   info: 'info.main',
   secondary: 'secondary.main',
   // MUI's Chip `color="default"` has no semantic palette entry of its own —
   // it renders in a neutral grey. `text.secondary` is the closest existing
   // token already used for the same "neutral/inactive" meaning elsewhere
   // (e.g. leadStatusStyles.finished).
   default: 'text.secondary',
};

export function paletteKeyToColorPath(key) {
   return PALETTE_KEY_TO_COLOR_PATH[key] || PALETTE_KEY_TO_COLOR_PATH.default;
}
