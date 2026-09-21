import PropTypes from 'prop-types';
import { Polyline } from 'react-leaflet';

export function RoutePolyline({ positions, style, onClick, children }) {
   return (
      <>
         <Polyline positions={positions} pathOptions={style.casing} />

         <Polyline
            positions={positions}
            pathOptions={style.path}
            eventHandlers={onClick ? { click: onClick } : undefined}
         >
            {children}
         </Polyline>
      </>
   );
}

RoutePolyline.propTypes = {
   positions: PropTypes.array.isRequired,
   style: PropTypes.shape({
      path: PropTypes.object.isRequired,
      casing: PropTypes.object.isRequired,
   }).isRequired,
   onClick: PropTypes.func,
   children: PropTypes.node,
};
