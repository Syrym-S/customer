import { useState } from 'react';
import { useTranslation } from "react-i18next";

import {
   Box,
   Button,
   DialogActions,
   DialogContent,
   IconButton,
   Typography,
   useMediaQuery,
   useTheme,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { AppDialog } from './AppDialog';
import { isNative } from '../config/platform';

export function MobileViewportModal() {
   const { t } = useTranslation();

   const theme = useTheme();
   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
   const [open, setOpen] = useState(isMobile && !isNative);

   function handleClose() {
      setOpen(false);
   }

   if (!isMobile || isNative) {
      return null;
   }

   return (
      <AppDialog
         open={open}
         onClose={handleClose}
         maxWidth='xs'
         fullWidth
         slotProps={{
            paper: {
               sx: {
                  m: { xs: 1, sm: 4 },
                  width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 64px)' },
                  maxHeight: {
                     xs: 'calc(100% - 16px)',
                     sm: 'calc(100% - 64px)',
                  },
               },
            },
         }}
      >
         <IconButton
            onClick={handleClose}
            size='small'
            sx={{
               position: 'absolute',
               top: 8,
               right: 8,
            }}
         >
            <CloseRoundedIcon fontSize='small' />
         </IconButton>

         <DialogContent>
            <Box
               sx={{
                  textAlign: 'center',
                  py: 2,
               }}
            >
               <Typography
                  variant='h6'
                  sx={{
                     fontWeight: 700,
                     mb: 1,
                  }}
               >
                  {t("mobileNotice.title")} 
               </Typography>

               <Typography color='text.secondary'>
                  {t("mobileNotice.text")}
               </Typography>
            </Box>
         </DialogContent>

         <DialogActions
            sx={{
               justifyContent: 'center',
               pb: 2.5,
            }}
         >
            <Button variant='contained' onClick={handleClose}>
               {t("common.actions.gotIt")}
            </Button>
         </DialogActions>
      </AppDialog>
   );
}
