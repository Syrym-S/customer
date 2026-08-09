import {
   formatDriverName,
   formatDriverPhone,
   normalizePhoneHref,
} from '../lib/driver.helpers';

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

