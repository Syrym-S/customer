import { useState } from 'react';
import PropTypes from 'prop-types';

import { LeadsContext } from './LeadsContext';

export function LeadsProvider({ children }) {
   const [openLead, setOpenLead] = useState(null);

   return (
      <LeadsContext.Provider value={{ openLead, setOpenLead }}>
         {children}
      </LeadsContext.Provider>
   );
}

LeadsProvider.propTypes = {
   children: PropTypes.node.isRequired,
};
