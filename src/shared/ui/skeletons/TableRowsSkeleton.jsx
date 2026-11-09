import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { Skeleton, TableCell, TableRow } from '@mui/material';

// Заглушка загрузки для обычной MUI-таблицы (не DataGrid, у которого есть
// свой скелетон-оверлей). Строки повторяют разметку колонок, поэтому шапка и
// ширины остаются на месте.
export function TableRowsSkeleton({ rows = 5, columnWidths }) {
   const { t } = useTranslation();

   return Array.from({ length: rows }, (_, rowIndex) => (
      <TableRow
         key={rowIndex}
         role="status"
         aria-label={rowIndex === 0 ? t('common.loading.list') : undefined}
      >
         {columnWidths.map((width, columnIndex) => (
            <TableCell key={columnIndex}>
               <Skeleton variant="text" width={width} />
            </TableCell>
         ))}
      </TableRow>
   ));
}

TableRowsSkeleton.propTypes = {
   rows: PropTypes.number,
   columnWidths: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
   ).isRequired,
};
