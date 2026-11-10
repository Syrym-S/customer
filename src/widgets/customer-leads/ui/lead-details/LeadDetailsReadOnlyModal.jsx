import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Alert, DialogContent } from '@mui/material';

import { DialogCloseButton } from '../../../../shared/ui/DialogCloseButton';
import { DetailsSkeleton } from '../../../../shared/ui/skeletons/DetailsSkeleton';
import { useCustomerMap } from '../../../customer-map/model/useCustomerMap';
import { createLeadEditForm } from '../../model/lead-edit-form.helpers';
import { LeadDetailsHeader } from './LeadDetailsHeader';
import { LeadDetailsMap } from './LeadDetailsMap';
import { LeadDetailsContent } from './LeadDetailsContent';
import { useLeadDetailsData } from './hooks/useLeadDetailsData';
import { useLeadDetailsRoute } from './hooks/useLeadDetailsRoute';
import { useLeadDetailsGeoTracking } from './hooks/useLeadDetailsGeoTracking';
import { useLeadDetailsDocuments } from './hooks/useLeadDetailsDocuments';
import { AppDialog } from '../../../../shared/ui/AppDialog';

export function LeadDetailsReadOnlyModal({ lead, onClose }) {
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

   const isInitialLoading = isLeadDetailsLoading && !leadDetails;

   return (
      <AppDialog
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
         <DialogCloseButton onClick={onClose} />

         <LeadDetailsHeader lead={currentLead} />

         <DialogContent sx={{ px: 3 }}>
            {leadDetailsError && (
               <Alert severity="error" sx={{ mb: 2 }}>
                  {leadDetailsError}
               </Alert>
            )}

            {isInitialLoading ? (
               <DetailsSkeleton sections={4} />
            ) : (
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
               </>
            )}
         </DialogContent>
      </AppDialog>
   );
}

LeadDetailsReadOnlyModal.propTypes = {
   lead: PropTypes.object,
   onClose: PropTypes.func.isRequired,
};
