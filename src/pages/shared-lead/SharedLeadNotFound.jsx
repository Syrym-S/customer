import { ErrorScreen } from '../../shared/ui/ErrorScreen';
import i18n from '../../shared/i18n';

export function SharedLeadNotFound() {
   return (
      <ErrorScreen
         code={404}
         message={i18n.t("sharedLead.notFound")}
      />
   );
}
