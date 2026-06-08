import { Stack } from '@mui/material';
import PropTypes from 'prop-types';

import { LeadCargoSection } from './sections/LeadCargoSection';
import { LeadDriverSection } from './sections/LeadDriverSection';
import { LeadRouteSection } from './sections/LeadRouteSection';
import { LeadForwarderSection } from './sections/LeadForwarderSection';

export function LeadDetailsContent({
   lead,
   isEditing,
   editForm,
   onEditChange,
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
         />

         <LeadForwarderSection
            lead={lead}
            isEditing={isEditing}
            editForm={editForm}
            onEditChange={onEditChange}
         />

         <LeadDriverSection
            lead={lead}
            isEditing={isEditing}
            editForm={editForm}
            onEditChange={onEditChange}
         />
      </Stack>
   );
}

LeadDetailsContent.propTypes = {
   lead: PropTypes.object.isRequired,
   isEditing: PropTypes.bool.isRequired,
   editForm: PropTypes.object.isRequired,
   onEditChange: PropTypes.func.isRequired,
};
