import { useTranslation } from 'react-i18next';

import { ErrorScreen } from '../../shared/ui/ErrorScreen';

export function SharedLeadNotFound() {
   // useTranslation (not the module-level i18n.t) so the message re-renders
   // when the visitor picks another language in the header switcher.
   const { t } = useTranslation();

   return (
      <ErrorScreen
         code={404}
         message={t("sharedLead.notFound")}
      />
   );
}
