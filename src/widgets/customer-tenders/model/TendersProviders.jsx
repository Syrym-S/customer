import { useMemo, useState } from 'react';
import { TendersContext } from './TendersContext';
import PropTypes from 'prop-types';

export function TendersProvider({ children }) {
   const [openTender, setOpenTender] = useState(null);

   const value = useMemo(
      () => ({
         openTender,
         setOpenTender,
      }),
      [openTender],
   );

   return (
      <TendersContext.Provider value={value}>
         {children}
      </TendersContext.Provider>
   );
}

TendersProvider.propTypes = {
   children: PropTypes.node.isRequired,
};
