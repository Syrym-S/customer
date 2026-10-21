import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
   Alert,
   Box,
   Button,
   Chip,
   CircularProgress,
   Dialog,
   DialogActions,
   DialogContent,
   Stack,
   Typography,
} from '@mui/material';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded';

import { DialogCloseButton } from '../../../shared/ui/DialogCloseButton';
import { useCustomerMap } from '../../customer-map/model/useCustomerMap';
import { createLeadEditForm } from '../../customer-leads/model/lead-edit-form.helpers';
import { LeadDetailsHeader } from '../../customer-leads/ui/lead-details/LeadDetailsHeader';
import { LeadDetailsMap } from '../../customer-leads/ui/lead-details/LeadDetailsMap';
import { LeadDetailsContent } from '../../customer-leads/ui/lead-details/LeadDetailsContent';
import { useLeadDetailsData } from '../../customer-leads/ui/lead-details/hooks/useLeadDetailsData';
import { useLeadDetailsRoute } from '../../customer-leads/ui/lead-details/hooks/useLeadDetailsRoute';
import { useLeadDetailsGeoTracking } from '../../customer-leads/ui/lead-details/hooks/useLeadDetailsGeoTracking';
import { useLeadDetailsDocuments } from '../../customer-leads/ui/lead-details/hooks/useLeadDetailsDocuments';
import {
   getLeadManufacturerName,
   getManufacturerBin,
   hasAttachedManufacturer,
} from '../model/manufacturers.helpers';

export function ManufacturerLeadDetailsModal({
   lead,
   isSubmitting = false,
   onClose,
   onAttach,
   onDetach,
}) {
   const map = useCustomerMap();

   const { leadDetails, isLeadDetailsLoading, leadDetailsError } =
      useLeadDetailsData(lead);

   const currentLead = leadDetails ?? lead;

   const readOnlyEditForm = useMemo(() => createLeadEditForm(null), []);

   const { route, routePoints, isRouteLoading } = useLeadDetailsRoute(leadDetails);
   const { geoPoints, geoCurrentPoint } = useLeadDetailsGeoTracking(
      lead?.id,
      currentLead?.status,
   );
   const {
      documents,
      isDocumentUploading,
      documentUploadError,
      deletingDocumentIds,
      handleAddDocument,
      handleDeleteDocument,
   } = useLeadDetailsDocuments(currentLead?.id);

   if (!lead || !currentLead) {
      return null;
   }

   const hasRoute = routePoints.length >= 2;

   const isLeadMapLoading =
      Boolean(currentLead?.id) &&
      !hasRoute &&
      (isLeadDetailsLoading || isRouteLoading || !leadDetails);

   const isAttached = hasAttachedManufacturer(lead);

   return (
      <Dialog
         open={Boolean(lead)}
         onClose={onClose}
         fullWidth
         maxWidth="md"
         slotProps={{
            paper: {
               sx: {
                  borderRadius: 4,
                  position: 'relative',
               },
            },
         }}
      >
         <DialogCloseButton onClick={onClose} disabled={isSubmitting} />

         <LeadDetailsHeader lead={currentLead} />

         <DialogContent sx={{ px: 3 }}>
            {isLeadDetailsLoading && (
               <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center', mb: 2 }}
               >
                  <CircularProgress size={18} />

                  <Typography color="text.secondary">
                     Загружаем детали заказа...
                  </Typography>
               </Stack>
            )}

            {leadDetailsError && (
               <Alert severity="error" sx={{ mb: 2 }}>
                  {leadDetailsError}
               </Alert>
            )}

            <Box
               sx={{
                  mb: 2,
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
               }}
            >
               <Typography
                  sx={{
                     fontSize: 13,
                     fontWeight: 600,
                     color: 'text.secondary',
                     mb: 0.75,
                  }}
               >
                  Производитель
               </Typography>

               {isAttached ? (
                  <Stack
                     direction={{ xs: 'column', sm: 'row' }}
                     spacing={1}
                     sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}
                  >
                     <Typography fontWeight={600}>
                        {getLeadManufacturerName(lead)}
                     </Typography>

                     <Chip
                        size="small"
                        variant="outlined"
                        label={`БИН ${getManufacturerBin(lead.manufacturer)}`}
                     />
                  </Stack>
               ) : (
                  <Typography color="text.secondary">
                     Производитель не привязан
                  </Typography>
               )}
            </Box>

            <LeadDetailsMap
               map={map}
               lead={currentLead}
               route={route}
               routePoints={routePoints}
               geoPoints={geoPoints}
               geoCurrentPoint={geoCurrentPoint}
               isRouteLoading={isLeadMapLoading}
            />

            <LeadDetailsContent
               lead={currentLead}
               isEditing={false}
               editForm={readOnlyEditForm}
               onEditChange={() => {}}
               documents={documents}
               onAddDocument={handleAddDocument}
               onDeleteDocument={handleDeleteDocument}
               isDocumentUploading={isDocumentUploading}
               documentUploadError={documentUploadError}
               deletingDocumentIds={deletingDocumentIds}
            />
         </DialogContent>

         <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            {isAttached && (
               <Button
                  color="error"
                  startIcon={<LinkOffRoundedIcon />}
                  onClick={() => onDetach(lead)}
                  disabled={isSubmitting}
               >
                  Открепить
               </Button>
            )}

            <Button
               variant="contained"
               startIcon={<LinkRoundedIcon />}
               onClick={() => onAttach(lead)}
               disabled={isSubmitting}
            >
               {isAttached ? 'Изменить производителя' : 'Привязать производителя'}
            </Button>
         </DialogActions>
      </Dialog>
   );
}

ManufacturerLeadDetailsModal.propTypes = {
   lead: PropTypes.object,
   isSubmitting: PropTypes.bool,
   onClose: PropTypes.func.isRequired,
   onAttach: PropTypes.func.isRequired,
   onDetach: PropTypes.func.isRequired,
};
