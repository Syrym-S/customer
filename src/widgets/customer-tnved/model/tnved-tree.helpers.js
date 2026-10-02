export function getNodeKey(path) {
   return path.join('-');
}

export function collectAllNodeKeys(nodes, parentPath = []) {
   const keys = [];

   nodes.forEach((node, index) => {
      const path = [...parentPath, index];

      keys.push(getNodeKey(path));

      if (Array.isArray(node.children) && node.children.length) {
         keys.push(...collectAllNodeKeys(node.children, path));
      }
   });

   return keys;
}
