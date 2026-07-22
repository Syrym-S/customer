import {
   Alert,
   Box,
   CircularProgress,
   Dialog,
   DialogContent,
   DialogTitle,
   Typography,
} from '@mui/material';

import { useNavigate, useParams } from 'react-router-dom';

import { useLeadsContext } from '../model/useLeadsContext';
import { useCustomerMap } from '../../customer-map/model/useCustomerMap';

import { LeadDetailsMap } from './lead-details/LeadDetailsMap';
import { LeadDetailsEditActions } from './lead-details/LeadDetailsEditActions';
import { LeadDetailsContent } from './lead-details/LeadDetailsContent';
import { LeadDetailsActions } from './lead-details/LeadDetailsActions';
import { LeadDetailsHeader } from './lead-details/LeadDetailsHeader';

import { useLeadDetailsData } from './lead-details/hooks/useLeadDetailsData';
import { useLeadDetailsRoute } from './lead-details/hooks/useLeadDetailsRoute';
import { useLeadDetailsDocuments } from './lead-details/hooks/useLeadDetailsDocuments';
import { useLeadDetailsGeoTracking } from './lead-details/hooks/useLeadDetailsGeoTracking';
import { useLeadDetailsMutations } from './lead-details/hooks/useLeadDetailsMutations';

export function LeadDetailsModal() {
   const navigate = useNavigate();
   const { leadId } = useParams();

   const map = useCustomerMap();
   const { openLead, setOpenLead, reloadLeads } = useLeadsContext();

   const {
      leadDetails,
      setLeadDetails,
      isLeadDetailsLoading,
      leadDetailsError,
      resetLeadDetails,
   } = useLeadDetailsData(openLead);

   const currentLead = leadDetails ?? openLead;

   const { route, routePoints, isRouteLoading, resetRoute } =
      useLeadDetailsRoute(leadDetails);

   const { geoPoints, geoCurrentPoint, resetGeoTracking } =
      useLeadDetailsGeoTracking(openLead?.id);

   const {
      documents,
      isDocumentUploading,
      documentUploadError,
      deletingDocumentIds,
      handleAddDocument,
      handleDeleteDocument,
      resetDocuments,
   } = useLeadDetailsDocuments(currentLead?.id);

   const {
      isEditing,
      isSavingEdit,
      saveEditError,
      editForm,
      deletingCargoIndex,
      deleteCargoError,
      handleEditChange,
      handleStartEdit,
      handleCancelEdit,
      handleSaveEdit,
      handleDeleteCargo,
      resetMutations,
   } = useLeadDetailsMutations({
      currentLead,
      setOpenLead,
      setLeadDetails,
      reloadLeads,
   });

   const isRoutePlaceholder = Boolean(openLead?.isRoutePlaceholder);

   const shouldShowRouteLeadLoader =
      isRoutePlaceholder && !leadDetails && isLeadDetailsLoading;

   const shouldRenderLeadDetails = !isRoutePlaceholder || Boolean(leadDetails);

   const hasRoute = routePoints.length >= 2;

   const isLeadMapLoading =
      Boolean(currentLead?.id) &&
      !hasRoute &&
      (isLeadDetailsLoading || isRouteLoading || !leadDetails);

   function handleClose() {
      setOpenLead(null);

      resetLeadDetails();
      resetRoute();
      resetGeoTracking();
      resetDocuments();
      resetMutations();

      if (leadId) {
         navigate('/customer', { replace: true });
      }
   }

   if (!openLead || !currentLead) {
      return null;
   }

   return (
      <Dialog
         open={Boolean(openLead)}
         onClose={handleClose}
         fullWidth
         maxWidth="md"
         slotProps={{
            paper: {
               sx: {
                  borderRadius: 4,
               },
            },
         }}
      >
         {shouldRenderLeadDetails ? (
            <LeadDetailsHeader lead={currentLead} />
         ) : (
            <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5 }}>
               <Typography
                  sx={{
                     fontSize: {
                        xs: '18px',
                        sm: '20px',
                     },
                     fontWeight: 600,
                     lineHeight: 1.3,
                  }}
               >
                  Лид #{openLead?.id}
               </Typography>

               <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
               >
                  Загружаем детали лида...
               </Typography>
            </DialogTitle>
         )}

         <DialogContent sx={{ px: 3 }}>
            {shouldShowRouteLeadLoader && (
               <Box
                  sx={{
                     minHeight: 360,
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                     justifyContent: 'center',
                     gap: 2,
                  }}
               >
                  <CircularProgress />

                  <Typography color="text.secondary">
                     Загружаем детали лида...
                  </Typography>
               </Box>
            )}

            {!shouldShowRouteLeadLoader && isLeadDetailsLoading && (
               <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Загружаем детали лида...
               </Typography>
            )}

            {leadDetailsError && (
               <Alert severity="error" sx={{ mb: 2 }}>
                  {leadDetailsError}
               </Alert>
            )}

            {saveEditError && (
               <Alert severity="error" sx={{ mb: 2 }}>
                  {saveEditError}
               </Alert>
            )}

            {deleteCargoError && (
               <Alert severity="error" sx={{ mb: 2 }}>
                  {deleteCargoError}
               </Alert>
            )}

            {shouldRenderLeadDetails && (
               <>
                  <LeadDetailsMap
                     map={map}
                     lead={currentLead}
                     route={route}
                     routePoints={routePoints}
                     geoPoints={geoPoints}
                     geoCurrentPoint={geoCurrentPoint}
                     isRouteLoading={isLeadMapLoading}
                  />

                  <LeadDetailsEditActions
                     isEditing={isEditing}
                     onStartEdit={handleStartEdit}
                     onCancelEdit={handleCancelEdit}
                  />

                  <LeadDetailsContent
                     lead={currentLead}
                     isEditing={isEditing}
                     editForm={editForm}
                     onEditChange={handleEditChange}
                     documents={documents}
                     onAddDocument={handleAddDocument}
                     onDeleteDocument={handleDeleteDocument}
                     isDocumentUploading={isDocumentUploading}
                     documentUploadError={documentUploadError}
                     deletingDocumentIds={deletingDocumentIds}
                     onDeleteCargo={handleDeleteCargo}
                     deletingCargoIndex={deletingCargoIndex}
                  />
               </>
            )}
         </DialogContent>

         <LeadDetailsActions
            isEditing={isEditing}
            isSaving={isSavingEdit}
            onSave={handleSaveEdit}
            onClose={handleClose}
         />
      </Dialog>
   );
}
