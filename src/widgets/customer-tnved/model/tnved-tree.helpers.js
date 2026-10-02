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
