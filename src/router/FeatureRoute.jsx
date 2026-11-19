import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

import { useFeatureFlagsStore } from '../shared/model/feature-flags.store';

const FALLBACK_ROUTE = '/customer/dashboard';

export function FeatureRoute({ flag, children }) {
   const isEnabled = useFeatureFlagsStore((state) => state[flag]);

   if (!isEnabled) {
      return <Navigate to={FALLBACK_ROUTE} replace />;
   }

   return children;
}

FeatureRoute.propTypes = {
   flag: PropTypes.string.isRequired,
   children: PropTypes.node,
};
