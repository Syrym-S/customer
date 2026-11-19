export function addPluginListener(plugin, eventName, handler) {
   if (typeof plugin?.addListener !== 'function') {
      return () => {};
   }

   let handle = null;
   let isRemoved = false;

   function remove() {
      isRemoved = true;

      try {
         handle?.remove?.();
      } catch {
         handle = null;
      }
   }

   try {
      const registration = plugin.addListener(eventName, handler);

      if (typeof registration?.then === 'function') {
         registration.then((resolvedHandle) => {
            handle = resolvedHandle;

            if (isRemoved) {
               remove();
            }
         });
      } else {
         handle = registration;
      }
   } catch {
      return () => {};
   }

   return remove;
}
