let handlers = [];

export function pushBackHandler(handler) {
   handlers = [...handlers, handler];

   return function removeBackHandler() {
      handlers = handlers.filter((item) => item !== handler);
   };
}

export function runTopBackHandler() {
   const handler = handlers[handlers.length - 1];

   if (!handler) {
      return false;
   }

   handlers = handlers.slice(0, -1);
   handler();

   return true;
}
