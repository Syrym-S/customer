import L from 'leaflet';

const ARROW_SPACING_PX = 160;
const MAX_ARROWS = 24;

export function buildArrowPlacements(map, positions, zoom) {
   if (!Array.isArray(positions) || positions.length < 2) {
      return [];
   }

   const projected = positions.map((position) =>
      map.project(L.latLng(position), zoom),
   );

   const segments = [];
   let total = 0;

   for (let index = 0; index < projected.length - 1; index += 1) {
      const from = projected[index];
      const to = projected[index + 1];
      const length = from.distanceTo(to);

      if (Number.isFinite(length) && length > 0) {
         segments.push({ from, to, length, start: total });
         total += length;
      }
   }

   if (!segments.length || total < ARROW_SPACING_PX / 2) {
      return [];
   }

   const spacing = Math.max(ARROW_SPACING_PX, total / MAX_ARROWS);
   const placements = [];
   let segmentIndex = 0;

   for (let distance = spacing / 2; distance < total; distance += spacing) {
      while (
         segmentIndex < segments.length - 1 &&
         segments[segmentIndex].start + segments[segmentIndex].length < distance
      ) {
         segmentIndex += 1;
      }

      const segment = segments[segmentIndex];
      const ratio = (distance - segment.start) / segment.length;
      const point = L.point(
         segment.from.x + (segment.to.x - segment.from.x) * ratio,
         segment.from.y + (segment.to.y - segment.from.y) * ratio,
      );
      const angle =
         (Math.atan2(
            segment.to.y - segment.from.y,
            segment.to.x - segment.from.x,
         ) *
            180) /
         Math.PI;

      placements.push({ position: map.unproject(point, zoom), angle });
   }

   return placements;
}
