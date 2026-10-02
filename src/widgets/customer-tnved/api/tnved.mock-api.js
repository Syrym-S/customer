import { flattenTnvedLeaves, tnvedTree } from '../model/tnved.mock';

function nodeMatchesQuery(node, normalizedQuery) {
   const codeMatches = node.code && node.code.includes(normalizedQuery);
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

export function filterTnvedTree(tree, query) {
   const normalizedQuery = String(query ?? '').trim().toLowerCase();

   if (!normalizedQuery) {
      return tree;
   }

   return tree
      .map((node) => filterTnvedNode(node, normalizedQuery))
      .filter(Boolean);
}

export async function fetchTnvedTreeMock() {
   return tnvedTree;
}

export async function searchTnvedMock(query) {
   return filterTnvedTree(tnvedTree, query);
}

export async function searchTnvedCodesMock(query) {
   const normalizedQuery = String(query ?? '').trim().toLowerCase();
   const leaves = flattenTnvedLeaves(tnvedTree);

   if (!normalizedQuery) {
      return leaves;
   }

   return leaves.filter(
      (leaf) =>
         leaf.code.includes(normalizedQuery) ||
         leaf.name.toLowerCase().includes(normalizedQuery),
   );
}
