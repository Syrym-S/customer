import { Box, Typography } from '@mui/material';

export function InfoBadge({
   label,
   value,
   variant = 'cozy',
   accent = false,
   muted = false,
   multiline = false,
   fullWidth = false,
   showTitle = false,
   fallback,
   valueFontWeight,
   sx = {},
}) {
   const isCompact = variant === 'compact';
   const resolvedFallback = fallback ?? (isCompact ? '—' : 'Не указано');
   const displayValue =
      value === null || value === undefined || value === ''
         ? resolvedFallback
         : value;

   return (
      <Box
         sx={{
            ...(isCompact ? { p: 1.25 } : { px: 1.5, py: 1 }),
            border: '1px solid',
            borderColor: isCompact
               ? accent
                  ? 'primary.light'
                  : 'divider'
               : muted
                 ? 'grey.300'
                 : 'divider',
            borderRadius: 2,
            backgroundColor: isCompact
               ? accent
                  ? 'rgba(33, 150, 243, 0.08)'
                  : 'grey.50'
               : muted
                 ? 'grey.200'
                 : 'grey.50',
            minWidth: 0,
            width: fullWidth ? '100%' : 'auto',
            ...sx,
         }}
      >
         <Typography
            color='text.secondary'
            sx={{
               fontSize: isCompact ? 12 : 11,
               lineHeight: isCompact ? undefined : 1.2,
               mb: isCompact ? 0.3 : 0.25,
            }}
         >
            {label}
         </Typography>

         <Typography
            component={isCompact ? 'div' : 'p'}
            title={showTitle ? value || resolvedFallback : undefined}
            sx={{
               fontSize: 14,
               fontWeight:
                  valueFontWeight ?? (isCompact ? (accent ? 600 : 400) : undefined),
               lineHeight: isCompact ? 1.35 : 1.3,
               color:
                  !isCompact && muted
                     ? 'text.secondary'
                     : accent
                       ? 'primary.main'
                       : 'text.primary',
               wordBreak: isCompact && !multiline ? undefined : 'break-word',
               overflow: isCompact && !multiline ? 'hidden' : undefined,
               textOverflow: isCompact
                  ? multiline
                     ? 'clip'
                     : 'ellipsis'
                  : undefined,
               whiteSpace: isCompact
                  ? multiline
                     ? 'normal'
                     : 'nowrap'
                  : undefined,
               overflowWrap: isCompact && multiline ? 'anywhere' : undefined,
            }}
         >
            {displayValue}
         </Typography>
      </Box>
   );
}
