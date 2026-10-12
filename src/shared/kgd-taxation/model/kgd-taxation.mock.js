export const TAXATION_REGIME_OPTIONS = [
   'Общеустановленный режим',
   'Упрощенная декларация',
   'Патент',
   'Специальный налоговый режим с использованием СНР',
   'НДС плательщик',
];

const mockTaxationByRoleAndId = {
   customer: {},
   forwarder: {},
   driver: {},
   factor: {},
};

function hashStringToIndex(value, modulo) {
   const normalized = String(value ?? '');
   let hash = 0;

   for (let i = 0; i < normalized.length; i += 1) {
      hash = (hash * 31 + normalized.charCodeAt(i)) % 1000000;
   }

   return hash % modulo;
}

export function getTaxationRegimeMock(role, entityId) {
   const cache = mockTaxationByRoleAndId[role] ?? mockTaxationByRoleAndId;

   if (cache[entityId]) {
      return cache[entityId];
   }

   const optionsCount = hashStringToIndex(`${role}:${entityId}`, 3) + 1;
   const startIndex = hashStringToIndex(`${entityId}:${role}`, TAXATION_REGIME_OPTIONS.length);

   const typeTaxation = Array.from({ length: optionsCount }, (_, offset) =>
      TAXATION_REGIME_OPTIONS[(startIndex + offset) % TAXATION_REGIME_OPTIONS.length],
   );

   const record = {
      id: `kgd-${role}-${entityId}`,
      role,
      typeTaxation,
      created_at: '2026-01-15T09:00:00Z',
      updated_at: '2026-06-02T12:30:00Z',
   };

   cache[entityId] = record;

   return record;
}
