import { Box, IconButton, TableCell, TableRow, Typography } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import PropTypes from 'prop-types';

import { getNodeKey } from '../model/tnved-tree.helpers';

const LEVEL_INDENT_PX = 24;

export function TnvedRow({
   node,
   level,
   expandedKeys,
   onToggle,
   isHighlighted,
}) {
   const nodeKey = getNodeKey(level, node.id);
   const hasChildren = Array.isArray(node.children) && node.children.length > 0;
   const isExpanded = expandedKeys.has(nodeKey);

   return (
      <TableRow
         sx={{
            backgroundColor: isHighlighted
               ? 'rgba(33, 150, 243, 0.08)'
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
                  <IconButton
                     size="small"
                     onClick={() => onToggle(nodeKey)}
                     aria-label={isExpanded ? 'Свернуть' : 'Развернуть'}
                  >
                     {isExpanded ? (
                        <ExpandMoreRoundedIcon fontSize="small" />
                     ) : (
                        <ChevronRightRoundedIcon fontSize="small" />
                     )}
                  </IconButton>
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
   expandedKeys: PropTypes.instanceOf(Set).isRequired,
   onToggle: PropTypes.func.isRequired,
   isHighlighted: PropTypes.bool,
};
