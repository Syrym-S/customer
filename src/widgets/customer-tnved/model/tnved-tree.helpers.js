// The catalog API paginates leaf-level codes, not tree nodes: each page
// returns the same ancestor chain (section → group → position →
// subposition) down to a different slice of `codes`. So loading page N+1
// must merge into the tree already built from earlier pages (matching
// nodes by id at every level), never replace it — otherwise codes loaded
// on previous pages disappear from the tree.
export function mergeTnvedTrees(existingNodes, incomingNodes) {
   const nodesById = new Map();

   existingNodes.forEach((node) => {
      nodesById.set(node.id, node);
   });

   incomingNodes.forEach((incomingNode) => {
      const existingNode = nodesById.get(incomingNode.id);

      if (!existingNode) {
         nodesById.set(incomingNode.id, incomingNode);
         return;
      }

      nodesById.set(incomingNode.id, {
         ...existingNode,
         ...incomingNode,
         children: mergeTnvedTrees(
            existingNode.children || [],
            incomingNode.children || [],
         ),
      });
   });

   return Array.from(nodesById.values());
}

export function getNodeKey(level, id) {
   return `${level}:${id}`;
}

export function collectAllNodeKeys(nodes, level = 0) {
   const keys = [];

   nodes.forEach((node) => {
      keys.push(getNodeKey(level, node.id));

      if (Array.isArray(node.children) && node.children.length) {
         keys.push(...collectAllNodeKeys(node.children, level + 1));
      }
   });

   return keys;
}
