import { Stack } from '@mui/material';
import PropTypes from 'prop-types';

import { LeadCargoSection } from './sections/LeadCargoSection';
import { LeadDriverSection } from './sections/LeadDriverSection';
import { LeadRouteSection } from './sections/LeadRouteSection';
import { LeadForwarderSection } from './sections/LeadForwarderSection';
import { LeadDocumentsSection } from './sections/LeadDocumentsSection';
import { AvrSection } from './sections/AvrSection';
import { isFinishedLead } from '../../model/lead.helpers';

export function LeadDetailsContent({
   lead,
   isEditing,
   editForm,
   onEditChange,
   routeControl,
   routeErrors,
   onTriggerRouteValidation,
   onRouteFieldChange,
   documents = [],
   onAddDocument,
   onDeleteDocument,
   isDocumentUploading = false,
   documentUploadError = '',
   deletingDocumentIds = [],
   onDeleteCargo,
   deletingCargoIndex = null,
}) {
   return (
      <Stack spacing={2}>
         <LeadRouteSection
            lead={lead}
            isEditing={isEditing}
            editForm={editForm}
            routeControl={routeControl}
            routeErrors={routeErrors}
            onTriggerRouteValidation={onTriggerRouteValidation}
            onRouteFieldChange={onRouteFieldChange}
         />

         <LeadCargoSection
            lead={lead}
            isEditing={isEditing}
            editForm={editForm}
            onEditChange={onEditChange}
            onDeleteCargo={onDeleteCargo}
            deletingCargoIndex={deletingCargoIndex}
         />

         <LeadForwarderSection
            lead={lead}
            isEditing={isEditing}
            editForm={editForm}
            onEditChange={onEditChange}
         />

         <LeadDriverSection lead={lead} />

         <LeadDocumentsSection
            lead={lead}
            documents={documents}
            onAddDocument={onAddDocument}
            onDeleteDocument={onDeleteDocument}
            isUploading={isDocumentUploading}
            uploadError={documentUploadError}
            deletingDocumentIds={deletingDocumentIds}
         />

         {isFinishedLead(lead) && <AvrSection lead={lead} />}
      </Stack>
   );
}

LeadDetailsContent.propTypes = {
   lead: PropTypes.object.isRequired,
   isEditing: PropTypes.bool.isRequired,
   editForm: PropTypes.object.isRequired,
   onEditChange: PropTypes.func.isRequired,
   routeControl: PropTypes.object,
   routeErrors: PropTypes.object,
   onTriggerRouteValidation: PropTypes.func,
   onRouteFieldChange: PropTypes.func,

   documents: PropTypes.arrayOf(
      PropTypes.shape({
         id: PropTypes.string.isRequired,
         name: PropTypes.string,
         context: PropTypes.string,
         fileName: PropTypes.string,
         fileUrl: PropTypes.string,
         fileType: PropTypes.string,
         createdAt: PropTypes.string,
      }),
   ).isRequired,
   onAddDocument: PropTypes.func.isRequired,
   onDeleteDocument: PropTypes.func.isRequired,
   isDocumentUploading: PropTypes.bool,
   documentUploadError: PropTypes.string,
   deletingDocumentIds: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   ),
};
