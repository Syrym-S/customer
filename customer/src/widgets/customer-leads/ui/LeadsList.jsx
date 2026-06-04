import { LeadsProvider } from '../model/LeadsProvider';
import { LeadsListContent } from './LeadsListContent';

export function LeadsList() {
   return (
      <LeadsProvider>
         <LeadsListContent />
      </LeadsProvider>
   );
}
