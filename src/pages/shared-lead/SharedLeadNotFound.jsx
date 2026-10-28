import { ErrorScreen } from '../../shared/ui/ErrorScreen';

export function SharedLeadNotFound() {
   return (
      <ErrorScreen
         code={404}
         message="Запрашиваемая страница не найдена. Проверьте, что ссылка скопирована полностью."
      />
   );
}
