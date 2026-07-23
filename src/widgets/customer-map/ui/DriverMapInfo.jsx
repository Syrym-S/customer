import PropTypes from 'prop-types';
import {
   formatDriverName,
   formatDriverPhone,
   normalizePhoneHref,
} from '../model/customer-map.helpers';

export function DriverMapInfo({ driver }) {
   const driverName = formatDriverName(driver);
   const driverPhone = formatDriverPhone(driver);
   const driverPhoneHref = normalizePhoneHref(driverPhone);

   return (
      <>
         <br />
         Водитель: {driverName}
         {driverPhone && (
            <>
               <br />
               Телефон:{' '}
               {driverPhoneHref ? (
                  <a href={`tel:${driverPhoneHref}`}>{driverPhone}</a>
               ) : (
                  driverPhone
               )}
            </>
         )}
      </>
   );
}

DriverMapInfo.propTypes = {
   driver: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      fio: PropTypes.string,
      name: PropTypes.string,
      fullName: PropTypes.string,
      full_name: PropTypes.string,
      phone: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      tel: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      telephone: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   }),
};
