const LEVEL_CHILD_KEYS = ['groups', 'positions', 'subpositions', 'codes'];

function normalizeTnvedNode(node, levelIndex) {
   const childKey = LEVEL_CHILD_KEYS[levelIndex];
   const rawChildren = childKey ? node[childKey] : undefined;

   const normalized = {
      id: node.id,
      code: node.code,
      name: node.name,
   };

   if (Array.isArray(rawChildren) && rawChildren.length) {
      normalized.children = rawChildren.map((child) =>
         normalizeTnvedNode(child, levelIndex + 1),
      );
   }

   return normalized;
}

export function normalizeTnvedTree(results) {
   return Array.isArray(results)
      ? results.map((node) => normalizeTnvedNode(node, 0))
      : [];
}

export function normalizeTnvedCatalogResponse(response) {
   return {
      results: normalizeTnvedTree(response?.results),
      page: response?.page ?? 1,
      perPage: response?.per_page ?? 100,
      count: response?.count ?? 0,
   };
}
