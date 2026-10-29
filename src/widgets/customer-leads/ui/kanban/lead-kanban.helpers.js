import {
   LEAD_KANBAN_COLUMNS,
   UNKNOWN_LEAD_STATUS,
} from './lead-kanban.constants';
import i18n from '../../../../shared/i18n';
import { formatAmount } from '../../../../shared/helpers/currency-format.helpers';

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
      return i18n.t("common.empty.notSpecifiedN");
   }

   if (typeof location === 'string') {
      return location || i18n.t("common.empty.notSpecifiedN");
   }

   return location.address || location.name || location.title || i18n.t("common.empty.notSpecifiedN");
}

export function getLeadForwarderName(lead) {
   const forwarder = lead?.forwarder;

   if (!forwarder) {
      return i18n.t("leads.forwarder.notAssigned");
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
      i18n.t("leads.forwarder.notAssigned")
   );
}

export function getLeadRouteLabel(lead) {
   return `${getLocationLabel(lead?.from_location.city)} → ${getLocationLabel(
      lead?.to_location.city,
   )}`;
}

export function getLeadCargoLabel(lead) {
   return lead?.cargo?.type || lead?.cargo?.name || i18n.t("common.empty.cargoNotSpecified");
}

export function getLeadPriceLabel(lead) {
   const formattedAmount = formatAmount(lead?.summ);

   if (!formattedAmount) {
      return i18n.t("common.empty.priceNotSpecified");
   }

   return `${formattedAmount} ${lead.currency || ''}`.trim();
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

   return forwarderName || i18n.t("leads.details.ownerNotSpecified");
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

   return `${formatAmount(total)} KZT`;
}
