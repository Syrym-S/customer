import PropTypes from 'prop-types';
import { Dialog } from '@mui/material';

// Единая обёртка над MUI Dialog с правилом закрытия модальных окон:
//
//   - кнопка "Закрыть"/"Отмена" или крестик (DialogCloseButton) — работают как и раньше;
//   - двойной щелчок за областью модалки — закрывает (reason: 'backdropDoubleClick');
//   - ОДИНОЧНЫЙ щелчок за областью модалки — НЕ закрывает;
//   - Esc — закрывает (стандартная клавиатурная доступность, при необходимости
//     отключается обычным disableEscapeKeyDown на конкретном месте вызова).
//
// Почему фильтра по reason достаточно: в MUI 9 одиночный клик по подложке приходит
// в onClose только с reason 'backdropClick' — и из обработчика onClick на root-слоте
// Dialog, и из собственного обработчика бэкдропа внутри Modal. Отбрасывая этот reason,
// мы перекрываем оба пути.
//
// Почему двойной клик слушается на container-слоте: container лежит ПОВЕРХ бэкдропа
// и занимает весь вьюпорт, поэтому щелчок мимо Paper попадает именно в него.
// Проверка target === currentTarget отсекает двойные щелчки внутри самой модалки
// (они всплывают до container, но с target на вложенном элементе).
export function AppDialog({ onClose, slotProps, children, ...rest }) {
   function handleClose(event, reason) {
      if (reason === 'backdropClick') {
         return;
      }

      onClose?.(event, reason);
   }

   function handleContainerDoubleClick(event) {
      slotProps?.container?.onDoubleClick?.(event);

      if (event.target !== event.currentTarget) {
         return;
      }

      onClose?.(event, 'backdropDoubleClick');
   }

   function handleBackdropDoubleClick(event) {
      slotProps?.backdrop?.onDoubleClick?.(event);

      onClose?.(event, 'backdropDoubleClick');
   }

   return (
      <Dialog
         {...rest}
         onClose={onClose ? handleClose : undefined}
         slotProps={{
            ...slotProps,
            container: {
               ...slotProps?.container,
               onDoubleClick: handleContainerDoubleClick,
            },
            backdrop: {
               ...slotProps?.backdrop,
               onDoubleClick: handleBackdropDoubleClick,
            },
         }}
      >
         {children}
      </Dialog>
   );
}

AppDialog.propTypes = {
   onClose: PropTypes.func,
   slotProps: PropTypes.object,
   children: PropTypes.node,
};
