import {
   LEAD_KANBAN_COLUMNS,
   UNKNOWN_LEAD_STATUS,
} from './lead-kanban.constants';

export function getLeadStatus(lead) {
   return lead?.status || UNKNOWN_LEAD_STATUS;
}

export function groupLeadsByStatus(leads) {
   return leads.reduce((acc, lead) => {
      const status = getLeadStatus(lead);

      if (!acc[status]) {
         acc[status] = [];
      }

      acc[status].push(lead);

      return acc;
   }, {});
}

export function getUnknownStatusLeads(leads) {
   const knownStatuses = new Set(
      LEAD_KANBAN_COLUMNS.map((column) => column.status),
   );

   return leads.filter((lead) => !knownStatuses.has(getLeadStatus(lead)));
}

export function getLocationLabel(location) {
   if (!location) {
      return 'Не указано';
   }

   if (typeof location === 'string') {
      return location || 'Не указано';
   }

   return location.address || location.name || location.title || 'Не указано';
}

export function getLeadForwarderName(lead) {
   const forwarder = lead?.forwarder;

   if (!forwarder) {
      return 'Экспедитор не назначен';
   }

   if (typeof forwarder === 'string') {
      return forwarder;
   }

   return (
      forwarder.companyName ||
      forwarder.company_name ||
      forwarder.fullName ||
      forwarder.full_name ||
      forwarder.fio ||
      forwarder.name ||
      forwarder.title ||
      'Экспедитор не назначен'
   );
}

export function getLeadRouteLabel(lead) {
   return `${getLocationLabel(lead?.from_location.city)} → ${getLocationLabel(
      lead?.to_location.city,
   )}`;
}

export function getLeadCargoLabel(lead) {
   return lead?.cargo?.type || lead?.cargo?.name || 'Груз не указан';
}

export function getLeadPriceLabel(lead) {
   if (lead?.summ === null || lead?.summ === undefined || lead?.summ === '') {
      return 'Цена не указана';
   }

   return `${Number(lead.summ).toLocaleString('ru-RU')} ${
      lead.currency || ''
   }`.trim();
}

export function getLeadResponsibleLabel(lead) {
   const driver = lead?.driver;
   const forwarder = lead?.forwarder;

   const driverName =
      driver?.fullName ||
      driver?.full_name ||
      driver?.fio ||
      driver?.name ||
      '';

   if (driverName) {
      return driverName;
   }

   const forwarderName =
      forwarder?.fullName ||
      forwarder?.full_name ||
      forwarder?.fio ||
      forwarder?.companyName ||
      forwarder?.company_name ||
      forwarder?.name ||
      '';

   return forwarderName || 'Ответственный не указан';
}

export function getLeadColumnTotal(leads) {
   return leads.reduce((total, lead) => {
      const amount = Number(lead?.summ);

      if (Number.isNaN(amount)) {
         return total;
      }

      return total + amount;
   }, 0);
}

export function getLeadColumnTotalLabel(leads) {
   const total = getLeadColumnTotal(leads);

   if (!total) {
      return '';
   }

   return `${total.toLocaleString('ru-RU')} KZT`;
}
