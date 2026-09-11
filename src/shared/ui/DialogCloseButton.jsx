import PropTypes from 'prop-types';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Standard top-right close (×) for detail modals — positioned absolutely on
// the Dialog's Paper, independent of whatever title/loading state is
// currently rendered inside it, so it stays in place across every branch of
// a modal (loaded, loading placeholder, error).
//
// top: every modal's title starts at pt: 3 (24px) and its first line of
// text renders at fontSize 20 / lineHeight 1.3 (the desktop/sm+ values —
// the ones actually seen in practice), giving a 26px line box whose visual
// center sits at 24 + 26/2 = 37px from the Paper's top edge. This button is
// a size="small" MuiIconButton (5px padding) around a fontSize="small"
// CloseIcon (20px), i.e. a 30px square — so top = 37 - 30/2 = 22px centers
// it on that same line.
//
// right: the header's own right padding is pr: 7 (56px, the gutter added
// in the earlier padding-collision fix) — that's the empty strip between
// the Paper's right edge and where title/chip content actually starts.
// Centering the 30px button inside that 56px gutter gives (56 - 30) / 2 =
// 13px of clearance on both sides, so right = 13 sits the button in the
// middle of the gutter instead of flush against the Paper edge.
export function DialogCloseButton({ onClick, disabled = false }) {
   return (
      <IconButton
         onClick={onClick}
         disabled={disabled}
         aria-label="Закрыть"
         size="small"
         sx={{
            position: 'absolute',
            top: 22,
            right: 13,
            zIndex: 1,
            color: 'text.secondary',
         }}
      >
         <CloseIcon fontSize="small" />
      </IconButton>
   );
}

DialogCloseButton.propTypes = {
   onClick: PropTypes.func.isRequired,
   disabled: PropTypes.bool,
};
