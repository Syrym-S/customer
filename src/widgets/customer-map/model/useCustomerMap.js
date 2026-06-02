export function useCustomerMap() {
   const center = [43.241141, 76.871399]; // Алматы, временно
   const zoom = 12;

   const markers = [
      {
         id: 1,
         position: [43.241141, 76.871399],
         title: 'Точка клиента',
         description: 'Временный маркер для проверки карты',
      },
   ];

   const routePoints = [];

   function handleMarkerClick(marker) {
      console.log('marker click:', marker);
   }

   return {
      center,
      zoom,
      markers,
      routePoints,
      handleMarkerClick,
   };
}
