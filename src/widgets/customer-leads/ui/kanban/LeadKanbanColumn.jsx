import { Box, Stack, Typography, useTheme } from '@mui/material';

import { LeadKanbanCard } from './LeadKanbanCard';

function getColumnAccentColor(theme, accentColor) {
   return theme.palette[accentColor]?.main || theme.palette.primary.main;
}

export function LeadKanbanColumn({
   title,
   leads,
   accentColor = 'primary',
   onOpenLead,
}) {
   const theme = useTheme();
   const columnColor = getColumnAccentColor(theme, accentColor);

   return (
      <Box
         sx={{
            minWidth: 300,
            width: 300,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '72vh',
            backgroundColor: 'transparent',
         }}
      >
         <Box
            sx={{
               px: 1,
               pt: 0.5,
               pb: 0.75,
            }}
         >
            <Box
               sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  mb: 0.5,
               }}
            >
               <Typography
                  title={title}
                  sx={{
                     fontSize: 13,
                     fontWeight: 800,
                     letterSpacing: '0.06em',
                     textTransform: 'uppercase',
                     lineHeight: 1.2,
                     color: 'text.primary',
                     overflow: 'hidden',
                     textOverflow: 'ellipsis',
                     whiteSpace: 'nowrap',
                  }}
               >
                  {title}
               </Typography>
            </Box>

            <Box
               sx={{
                  mt: 1,
                  height: 2,
                  width: '100%',
                  borderRadius: 999,
                  backgroundColor: columnColor,
               }}
            />
         </Box>

         <Stack
            spacing={1}
            sx={{
               pt: 1,
               px: 0.5,
               pb: 1,
               overflowY: 'auto',
               flex: 1,
               minHeight: 220,
            }}
         >
            {leads.length === 0 ? (
               <Typography
                  sx={{
                     px: 1,
                     py: 1,
                     fontSize: 12,
                     color: 'text.secondary',
                  }}
               >
                  Нет лидов
               </Typography>
            ) : (
               leads.map((lead) => (
                  <LeadKanbanCard
                     key={lead.id}
                     lead={lead}
                     onOpen={onOpenLead}
                  />
               ))
            )}
         </Stack>
      </Box>
   );
}
