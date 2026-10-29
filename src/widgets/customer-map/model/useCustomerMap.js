import i18n from '../../../shared/i18n';

export function useCustomerMap() {
   const center = [43.241141, 76.871399]; // Алматы, временно
   const zoom = 12;

   const markers = [
      {
         id: 1,
         position: [43.241141, 76.871399],
         title: i18n.t("map.customerPoint"),
         description: i18n.t("map.devMarker"),
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
