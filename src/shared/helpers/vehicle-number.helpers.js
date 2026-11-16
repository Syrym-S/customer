const EMPTY_VEHICLE_NUMBER_VALUES = ['NULL', 'UNDEFINED', '-'];

export function formatVehicleNumber(value) {
   if (value === null || value === undefined) {
      return '';
   }

   const normalized = String(value)
      .trim()
      .toUpperCase()
      .replace(/\s+/g, ' ');

   if (!normalized || EMPTY_VEHICLE_NUMBER_VALUES.includes(normalized)) {
      return '';
   }

   return normalized;
}

export function getDriverVehicleNumber(driver, lead) {
   const rawValue =
      (driver && typeof driver === 'object'
         ? (driver.vehicle_number ?? driver.vehicleNumber)
         : null) ??
      lead?.driver_vehicle_number ??
      lead?.driverVehicleNumber ??
      lead?.raw?.driver_vehicle_number ??
      null;

   return formatVehicleNumber(rawValue);
}
