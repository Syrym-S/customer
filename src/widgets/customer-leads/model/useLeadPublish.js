import { useCallback, useState } from 'react';
import i18n from '../../../shared/i18n';

import { publishLead } from '../api/leads.repository';
import { useLeadsContext } from './useLeadsContext';
import { notifyError } from '../../../shared/model/notifications.store';

export function useLeadPublish() {
   const { reloadLeads } = useLeadsContext();
   const [isPublishing, setIsPublishing] = useState(false);

   const publishDraft = useCallback(
      async (leadId) => {
         if (!leadId || isPublishing) {
            return false;
         }

         try {
            setIsPublishing(true);

            await publishLead(leadId);
            await reloadLeads({ withLoader: false });

            return true;
         } catch (error) {
            const message =
               error.response?.data?.message ||
               error.message ||
               i18n.t("leads.publish.failed");

            notifyError(message);

            return false;
         } finally {
            setIsPublishing(false);
         }
      },
      [isPublishing, reloadLeads],
   );

   return { publishDraft, isPublishing };
}
