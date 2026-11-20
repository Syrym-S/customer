import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Box, Button, Stack, Typography } from '@mui/material';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import {
   getEmailHref,
   getPhoneHref,
   handleContactLinkClick,
} from '../../../shared/lib/contact-links';

export function AdvertisementContacts({ contacts, variant = 'buttons' }) {
   const { t } = useTranslation();

   const phone = String(contacts?.phone ?? '').trim();
   const email = String(contacts?.email ?? '').trim();

   if (!phone && !email) {
      return null;
   }

   if (variant === 'text') {
      return (
         <Stack spacing={0.5}>
            {phone && (
               <Typography variant="body2">
                  <Box component="span" color="text.secondary">
                     {t('common.fields.phone')}:{' '}
                  </Box>

                  {phone}
               </Typography>
            )}

            {email && (
               <Typography variant="body2">
                  <Box component="span" color="text.secondary">
                     {t('common.fields.email')}:{' '}
                  </Box>

                  {email}
               </Typography>
            )}
         </Stack>
      );
   }

   return (
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
         {phone && (
            <Button
               size="small"
               variant="outlined"
               startIcon={<CallOutlinedIcon />}
               href={getPhoneHref(phone)}
               onClick={(event) =>
                  handleContactLinkClick(event, getPhoneHref(phone))
               }
            >
               {t('advertisements.contacts.call')}
            </Button>
         )}

         {email && (
            <Button
               size="small"
               variant="outlined"
               startIcon={<MailOutlineRoundedIcon />}
               href={getEmailHref(email)}
               onClick={(event) =>
                  handleContactLinkClick(event, getEmailHref(email))
               }
            >
               {t('advertisements.contacts.email')}
            </Button>
         )}
      </Stack>
   );
}

AdvertisementContacts.propTypes = {
   contacts: PropTypes.shape({
      phone: PropTypes.string,
      email: PropTypes.string,
   }),
   variant: PropTypes.oneOf(['buttons', 'text']),
};
