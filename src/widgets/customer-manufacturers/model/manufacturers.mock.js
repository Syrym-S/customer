export const mockManufacturersCatalog = [
   {
      id: '6714f2a1c4d5e6f7a8b9c0d1',
      companyName: 'ТОО «KazSteel Production»',
      companyBin: '123456789012',
   },
   {
      id: '6714f2a1c4d5e6f7a8b9c0d2',
      companyName: 'ТОО «Алматы Агро Фуд»',
      companyBin: '123456789013',
   },
   {
      id: '6714f2a1c4d5e6f7a8b9c0d3',
      companyName: 'ТОО «Astana Build Materials»',
      companyBin: '123456789014',
   },
   {
      id: '6714f2a1c4d5e6f7a8b9c0d4',
      companyName: 'ТОО «Caspian Oil Chemicals»',
      companyBin: '123456789015',
   },
   {
      id: '6714f2a1c4d5e6f7a8b9c0d5',
      companyName: 'ТОО «Shymkent Textile»',
      companyBin: '123456789016',
   },
   {
      id: '6714f2a1c4d5e6f7a8b9c0d6',
      companyName: 'ТОО «Pavlodar Plastic Group»',
      companyBin: '123456789017',
   },
   {
      id: '6714f2a1c4d5e6f7a8b9c0d7',
      companyName: 'ТОО «Kostanay Grain»',
      companyBin: '123456789018',
   },
   {
      id: '6714f2a1c4d5e6f7a8b9c0d8',
      companyName: 'ТОО «Aktobe Machinery»',
      companyBin: '123456789019',
   },
];

function buildInitialCustomerLinks() {
   const links = new Map();

   mockManufacturersCatalog.slice(0, 5).forEach((manufacturer, index) => {
      const linkedAt = new Date(2025, 8, 2 + index * 4, 11, 20 + index);

      links.set(manufacturer.id, linkedAt.toISOString());
   });

   return links;
}

function buildInitialLeadLinks() {
   const links = new Map();
   const linkedManufacturers = Array.from(buildInitialCustomerLinks().keys());

   for (let index = 0; index < 60; index += 3) {
      const manufacturerId =
         linkedManufacturers[(index / 3) % linkedManufacturers.length];

      links.set(`mock-lead-${index + 1}`, manufacturerId);
   }

   return links;
}

export const mockCustomerManufacturerLinks = buildInitialCustomerLinks();

export const mockLeadManufacturerLinks = buildInitialLeadLinks();
