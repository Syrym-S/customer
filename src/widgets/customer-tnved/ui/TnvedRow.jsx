import { Box, TableCell, TableRow, Typography, alpha } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import PropTypes from 'prop-types';

const LEVEL_INDENT_PX = 24;

export function TnvedRow({ node, level, isHighlighted, isOdd }) {
   const hasChildren = Array.isArray(node.children) && node.children.length > 0;

   return (
      <TableRow
         sx={{
            // Same zebra token the DataGrid tables use (theme.js's
            // `.row-odd` rule) — kept consistent here since this table is a
            // plain MUI Table, not a DataGrid, so it can't share that class.
            backgroundColor: isHighlighted
               ? 'rgba(33, 150, 243, 0.08)'
               : isOdd
                 ? (theme) => alpha(theme.palette.divider, 0.32)
                 : 'transparent',
         }}
      >
         <TableCell sx={{ width: 140, fontWeight: node.code ? 500 : 400 }}>
            {node.code || ''}
         </TableCell>

         <TableCell>
            <Box
               sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  pl: level * LEVEL_INDENT_PX / 8,
               }}
            >
               {hasChildren ? (
                  <Box
                     sx={{
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                     }}
                  >
                     <ExpandMoreRoundedIcon fontSize="small" />
                  </Box>
               ) : (
                  <Box sx={{ width: 32 }} />
               )}

               <Typography
                  sx={{
                     fontSize: 14,
                     fontWeight: level === 0 ? 600 : 400,
                  }}
               >
                  {node.name}
               </Typography>
            </Box>
         </TableCell>
      </TableRow>
   );
}

TnvedRow.propTypes = {
   node: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      code: PropTypes.string,
      name: PropTypes.string.isRequired,
      children: PropTypes.array,
   }).isRequired,
   level: PropTypes.number.isRequired,
   isHighlighted: PropTypes.bool,
};
