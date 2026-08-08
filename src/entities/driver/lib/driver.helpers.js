export function formatDriverName(driver) {
   return (
      driver?.fio ||
      driver?.name ||
      driver?.fullName ||
      driver?.full_name ||
      'Водитель не указан'
   );
}

export function formatDriverPhone(driver) {
   return driver?.phone || driver?.tel || driver?.telephone || '';
}

export function normalizePhoneHref(phone) {
   if (!phone) {
      return '';
   }

   const normalizedPhone = String(phone).replace(/[^\d+]/g, '');

   if (!normalizedPhone) {
      return '';
   }

   return normalizedPhone.startsWith('+')
      ? normalizedPhone
      : `+${normalizedPhone}`;
}
