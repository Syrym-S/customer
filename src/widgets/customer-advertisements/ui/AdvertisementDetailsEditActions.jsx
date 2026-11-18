import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

export function AdvertisementDetailsEditActions({
   isClosed = false,
   isEditing,
   isSaving = false,
   onStartEdit,
   onCancelEdit,
}) {
   const { t } = useTranslation();

   const editTooltipTitle = isClosed
      ? t('advertisements.edit.blockedClosed')
      : t('common.actions.edit');

   return (
      <Box
         sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
            mb: 2,
         }}
      >
         {isEditing ? (
            <Button onClick={onCancelEdit} disabled={isSaving}>
               {t('common.actions.cancel')}
            </Button>
         ) : (
            <Tooltip title={editTooltipTitle}>
               <span style={{ display: 'inline-flex' }}>
                  <IconButton
                     color="primary"
                     aria-label={t('common.actions.edit')}
                     onClick={onStartEdit}
                     disabled={isClosed}
                  >
                     <EditOutlinedIcon fontSize="small" />
                  </IconButton>
               </span>
            </Tooltip>
         )}
      </Box>
   );
}

AdvertisementDetailsEditActions.propTypes = {
   isClosed: PropTypes.bool,
   isEditing: PropTypes.bool.isRequired,
   isSaving: PropTypes.bool,
   onStartEdit: PropTypes.func.isRequired,
   onCancelEdit: PropTypes.func.isRequired,
};
