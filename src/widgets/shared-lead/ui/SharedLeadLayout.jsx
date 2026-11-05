import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

import logoSrc from '../../../../assets/logo.png';
import { SupportContacts } from '../../../shared/ui/SupportContacts';
import { LanguageSwitcher } from '../../../shared/ui/LanguageSwitcher';

export function SharedLeadLayout() {
   return (
      <Box sx={{ minHeight: '100vh' }}>
         <Box
            component="header"
            sx={{
               position: 'sticky',
               top: 0,
               zIndex: 1100,
               minHeight: 64,
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'space-between',
               flexWrap: 'wrap',
               gap: 1.5,
               px: { xs: 2, sm: 3 },
               py: 1,
               borderBottom: '1px solid',
               borderColor: 'divider',
               backgroundColor: 'background.paper',
            }}
         >
            <Box
               component="img"
               src={logoSrc}
               alt="360 Logistics"
               sx={{
                  height: { xs: 28, sm: 32 },
                  width: 'auto',
                  maxWidth: { xs: 130, sm: 170 },
                  objectFit: 'contain',
                  display: 'block',
               }}
            />

            <Box
               sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  minWidth: 0,
                  flexShrink: 0,
               }}
            >
               <Box sx={{ maxWidth: { xs: 240, sm: 340 }, minWidth: 0 }}>
                  <SupportContacts layout="row" />
               </Box>

               {/* A shared link is usually opened by an outside party whose
                   language we can only guess from the browser, and this bundle
                   has no header or settings page — so the public page needs its
                   own switcher. The languages store keeps its
                   SUPPORTED_LANGUAGES default here (loadLanguages() hits an
                   authenticated endpoint and never runs in PublicApp), so every
                   bundled locale is offered without a request. */}
               <LanguageSwitcher sx={{ flexShrink: 0 }} />
            </Box>
         </Box>

         <Box
            component="main"
            sx={{
               maxWidth: 900,
               mx: 'auto',
               p: { xs: 2, sm: 3 },
            }}
         >
            <Outlet />
         </Box>
      </Box>
   );
}
