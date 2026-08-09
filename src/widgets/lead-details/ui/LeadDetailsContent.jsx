import { Stack } from '@mui/material';

import { LeadCargoSection } from './sections/LeadCargoSection';
import { LeadDriverSection } from './sections/LeadDriverSection';
import { LeadRouteSection } from './sections/LeadRouteSection';
import { LeadForwarderSection } from './sections/LeadForwarderSection';
import { LeadDocumentsSection } from './sections/LeadDocumentsSection';

export function LeadDetailsContent({
   lead,
   isEditing,
   editForm,
   onEditChange,
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
            onEditChange={onEditChange}
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
            documents={documents}
            onAddDocument={onAddDocument}
            onDeleteDocument={onDeleteDocument}
            isUploading={isDocumentUploading}
            uploadError={documentUploadError}
            deletingDocumentIds={deletingDocumentIds}
         />
      </Stack>
   );
}

