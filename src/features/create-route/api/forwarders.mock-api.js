import { forwardersMock } from '../model/forwarders.mock';

function normalize(value) {
   return String(value ?? '')
      .toLowerCase()
      .trim();
}

export async function searchForwardersMock(query) {
   const normalizedQuery = normalize(query);

   if (!normalizedQuery) {
      return [];
   }

   return forwardersMock.filter((forwarder) => {
      const searchableText = [
         forwarder.fullName,
         forwarder.iin,
         forwarder.companyName,
         forwarder.companyBin,
         forwarder.phone,
      ]
         .map(normalize)
         .join(' ');

      return searchableText.includes(normalizedQuery);
   });
}
