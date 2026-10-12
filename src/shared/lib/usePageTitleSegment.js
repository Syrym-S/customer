import { useEffect, useId } from 'react';
import { useTitleStore } from '../model/title.store';

/**
 * Регистрирует дополнительный сегмент "<title>" (вкладка, модалка с
 * деталями, шаг визарда, ...) на всё время, пока вызывающий компонент
 * смонтирован и label не пустой. Одновременно может быть активно несколько
 * сегментов; `order` задаёт их порядок слева направо после базового
 * заголовка страницы.
 *
 * Пример: пока открыта модалка с деталями заявки ->
 *   usePageTitleSegment(lead ? `Перевозки #${lead.num}` : null);
 */
export function usePageTitleSegment(label, order = 1) {
   const key = useId();
   const setSegment = useTitleStore((state) => state.setSegment);
   const removeSegment = useTitleStore((state) => state.removeSegment);

   useEffect(() => {
      if (!label) {
         removeSegment(key);
         return;
      }

      setSegment(key, label, order);

      return () => removeSegment(key);
   }, [key, label, order, setSegment, removeSegment]);
}
