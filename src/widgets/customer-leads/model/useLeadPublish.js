import { useCallback, useState } from 'react';

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
               'Не удалось опубликовать заказ';

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
