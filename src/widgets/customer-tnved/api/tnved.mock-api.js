import { flattenTnvedLeaves, tnvedTree } from '../model/tnved.mock';

function nodeMatchesQuery(node, normalizedQuery) {
   const codeMatches =
      node.code && node.code.toLowerCase().startsWith(normalizedQuery);
   const nameMatches = node.name.toLowerCase().includes(normalizedQuery);

   return Boolean(codeMatches || nameMatches);
}

function filterTnvedNode(node, normalizedQuery) {
   if (nodeMatchesQuery(node, normalizedQuery)) {
      return node;
   }

   if (!Array.isArray(node.children)) {
      return null;
   }

   const filteredChildren = node.children
      .map((child) => filterTnvedNode(child, normalizedQuery))
      .filter(Boolean);

   if (!filteredChildren.length) {
      return null;
   }

   return { ...node, children: filteredChildren };
}

function filterTnvedTree(tree, normalizedQuery) {
   if (!normalizedQuery) {
      return tree;
   }

   return tree
      .map((node) => filterTnvedNode(node, normalizedQuery))
      .filter(Boolean);
}

function flattenLeafChains(nodes, chain = []) {
   let chains = [];

   nodes.forEach((node) => {
      const nextChain = [...chain, node];

      if (Array.isArray(node.children) && node.children.length) {
         chains = chains.concat(flattenLeafChains(node.children, nextChain));
      } else {
         chains.push(nextChain);
      }
   });

   return chains;
}

function buildTreeFromChains(chains) {
   const roots = [];
   const rootMap = new Map();

   chains.forEach((chain) => {
      let currentMap = rootMap;
      let currentArray = roots;

      chain.forEach((node, depth) => {
         const isLeaf = depth === chain.length - 1;
         let existing = currentMap.get(node.id);

         if (!existing) {
            existing = isLeaf
               ? { id: node.id, code: node.code, name: node.name }
               : {
                    id: node.id,
                    code: node.code,
                    name: node.name,
                    children: [],
                    childMap: new Map(),
                 };

            currentMap.set(node.id, existing);
            currentArray.push(existing);
         }

         if (!isLeaf) {
            currentMap = existing.childMap;
            currentArray = existing.children;
         }
      });
   });

   function stripInternalMaps(nodes) {
      nodes.forEach((node) => {
         delete node.childMap;

         if (Array.isArray(node.children)) {
            stripInternalMaps(node.children);
         }
      });
   }

   stripInternalMaps(roots);

   return roots;
}

export async function fetchTnvedCatalogMock({ q, page = 1, perPage = 100 } = {}) {
   const normalizedQuery = String(q ?? '').trim().toLowerCase();
   const filteredTree = filterTnvedTree(tnvedTree, normalizedQuery);
   const leafChains = flattenLeafChains(filteredTree);

   const cappedPerPage = Math.min(perPage ?? 100, 100);
   const startIndex = (page - 1) * cappedPerPage;
   const pageChains = leafChains.slice(startIndex, startIndex + cappedPerPage);

   return {
      results: buildTreeFromChains(pageChains),
      page,
      perPage: cappedPerPage,
      count: leafChains.length,
   };
}

export function findTnvedByCodeMock(code) {
   const leaf = flattenTnvedLeaves(tnvedTree).find(
      (item) => item.code === code,
   );

   return leaf ? { code: leaf.code, name: leaf.name } : null;
}

export async function searchTnvedCodesMock(q, limit = 10) {
   const normalizedQuery = String(q ?? '').trim().toLowerCase();
   const cappedLimit = Math.min(limit ?? 10, 100);
   const leaves = flattenTnvedLeaves(tnvedTree);

   const matches = normalizedQuery
      ? leaves.filter((leaf) => nodeMatchesQuery(leaf, normalizedQuery))
      : leaves;

   return matches
      .slice(0, cappedLimit)
      .map((leaf) => ({ code: leaf.code, name: leaf.name }));
}
