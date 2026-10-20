import {
   mockCustomerManufacturerLinks,
   mockLeadManufacturerLinks,
   mockManufacturersCatalog,
} from '../model/manufacturers.mock';

function findInCatalog(manufacturerId) {
   return (
      mockManufacturersCatalog.find(
         (manufacturer) => manufacturer.id === manufacturerId,
      ) || null
   );
}

export function getMockLeadManufacturer(leadId) {
   const manufacturerId = mockLeadManufacturerLinks.get(leadId);

   if (!manufacturerId) {
      return null;
   }

   return findInCatalog(manufacturerId);
}

export async function searchManufacturersMock(query) {
   const normalizedQuery = String(query ?? '').trim().toLowerCase();

   if (!normalizedQuery) {
      return { items: [] };
   }

   return {
      items: mockManufacturersCatalog.filter((manufacturer) =>
         [manufacturer.companyName, manufacturer.companyBin].some((field) =>
            String(field).toLowerCase().includes(normalizedQuery),
         ),
      ),
   };
}

export async function fetchMyManufacturersMock() {
   const items = [];

   mockCustomerManufacturerLinks.forEach((linkedAt, manufacturerId) => {
      const manufacturer = findInCatalog(manufacturerId);

      if (manufacturer) {
         items.push({ ...manufacturer, linkedAt });
      }
   });

   return { items };
}

export async function attachManufacturerMock(manufacturerId) {
   if (!findInCatalog(manufacturerId)) {
      throw new Error('Manufacturer not found');
   }

   mockCustomerManufacturerLinks.set(manufacturerId, new Date().toISOString());

   return { message: 'Manufacturer attached' };
}

export async function detachManufacturerMock(manufacturerId) {
   if (!mockCustomerManufacturerLinks.delete(manufacturerId)) {
      throw new Error('Link not found');
   }

   mockLeadManufacturerLinks.forEach((linkedManufacturerId, leadId) => {
      if (linkedManufacturerId === manufacturerId) {
         mockLeadManufacturerLinks.delete(leadId);
      }
   });

   return { message: 'Manufacturer detached' };
}

export async function attachManufacturerToLeadMock(leadId, manufacturerId) {
   if (!mockCustomerManufacturerLinks.has(manufacturerId)) {
      throw new Error('Производитель не привязан к заказчику');
   }

   mockLeadManufacturerLinks.set(leadId, manufacturerId);

   return { message: 'Manufacturer attached to lead' };
}

export async function detachManufacturerFromLeadMock(leadId) {
   if (!mockLeadManufacturerLinks.delete(leadId)) {
      throw new Error('Manufacturer not found');
   }

   return { message: 'Manufacturer detached from lead' };
}
