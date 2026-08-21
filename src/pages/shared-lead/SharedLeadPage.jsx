import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

import { useCustomerMap } from '../../widgets/customer-map/model/useCustomerMap';
import { LeadDetailsMap } from '../../widgets/customer-leads/ui/lead-details/LeadDetailsMap';
import { LeadRouteSection } from '../../widgets/customer-leads/ui/lead-details/sections/LeadRouteSection';
import { LeadCargoSection } from '../../widgets/customer-leads/ui/lead-details/sections/LeadCargoSection';
import { LeadForwarderSection } from '../../widgets/customer-leads/ui/lead-details/sections/LeadForwarderSection';
import { LeadDriverSection } from '../../widgets/customer-leads/ui/lead-details/sections/LeadDriverSection';
import { DetailSection } from '../../widgets/customer-leads/ui/lead-details/components/DetailSection';
import { LeadDocumentCard } from '../../widgets/customer-leads/ui/lead-details/components/documents/LeadDocumentCard';
import { DocumentPreviewDialog } from '../../widgets/customer-leads/ui/lead-details/components/documents/DocumentPreviewDialog';
import { LeadStatusChip } from '../../widgets/dashboard/ui/DashboardLeadItem';
import { getSharedLeadApi } from '../../widgets/customer-leads/api/shared-lead.api';
import { mapLeadDetailsResponseFromApi } from '../../widgets/customer-leads/model/lead.adapter';
import { getLocationPosition } from '../../widgets/customer-leads/model/lead-details-map.helpers';
import {
   decodeRoutePolyline,
   getEncodedPolylineFromRoute,
} from '../../widgets/customer-leads/lib/route-polyline.helpers';
import { useSharedLeadGeoTracking } from '../../widgets/customer-leads/ui/lead-details/hooks/useSharedLeadGeoTracking';

const noop = () => {};

const LOAD_ERROR_MESSAGE =
   'Ссылка недействительна или срок её действия истёк.';

// Same reasoning as the authenticated modal's waypoint markers (see
// LeadDetailsMap.jsx): waypoints are always plotted as their own markers on
// top of the route line, independently of how that line itself was built —
// the polyline doesn't make them redundant, so this stays unchanged whether
// we end up using the decoded route or the straight-line fallback below.

// Fallback only: used when this lead has no computed route yet. Straight
// line built directly from from_location/to_location/waypoint coordinates —
// mapLeadFromApi turns from_location/to_location into a plain display
// string (see lead.adapter.js), discarding any lat/lng they carry, but this
// endpoint's raw payload puts coordinates directly on them (confirmed by
// backend), same as it already does for waypoints.
function getStraightLineRoutePoints(lead) {
   const fromPoint = getLocationPosition(lead?.raw?.from_location);
   const toPoint = getLocationPosition(lead?.raw?.to_location);

   const waypointPoints = Array.isArray(lead?.waypoints)
      ? lead.waypoints.map(getLocationPosition).filter(Boolean)
      : [];

   return [fromPoint, ...waypointPoints, toPoint].filter(Boolean);
}

// This endpoint now returns lead.routes[0].polyline.encodedPolyline — a real
// road-following route, same encoding format the authenticated flow already
// decodes via generateRoute (see useLeadDetailsRoute + route-polyline.helpers.js).
// Reuse that exact decode path instead of the straight line whenever a route
// is actually present.
function getSharedLeadRoute(lead) {
   const routes = Array.isArray(lead?.raw?.routes) ? lead.raw.routes : [];
   const mainRoute = routes[0] ?? null;

   const encodedPolyline = getEncodedPolylineFromRoute(mainRoute);
   const decodedPoints = decodeRoutePolyline(encodedPolyline);

   if (decodedPoints.length >= 2) {
      return { route: mainRoute, routePoints: decodedPoints };
   }

   return { route: null, routePoints: getStraightLineRoutePoints(lead) };
}

export function SharedLeadPage() {
   const { leadId, token } = useParams();
   const [selectedDocument, setSelectedDocument] = useState(null);
   const [lead, setLead] = useState(null);
   const [isLoading, setIsLoading] = useState(true);
   const [loadError, setLoadError] = useState('');

   const map = useCustomerMap();
   const { geoPoints, geoCurrentPoint } = useSharedLeadGeoTracking(lead);

   useEffect(() => {
      let isCancelled = false;

      async function loadSharedLead() {
         setIsLoading(true);
         setLoadError('');

         try {
            const response = await getSharedLeadApi(leadId, token);
            const nextLead = mapLeadDetailsResponseFromApi(response);

            if (isCancelled) {
               return;
            }

            if (nextLead) {
               setLead(nextLead);
            } else {
               setLead(null);
               setLoadError(LOAD_ERROR_MESSAGE);
            }
         } catch {
            if (!isCancelled) {
               setLead(null);
               setLoadError(LOAD_ERROR_MESSAGE);
            }
         } finally {
            if (!isCancelled) {
               setIsLoading(false);
            }
         }
      }

      loadSharedLead();

      return () => {
         isCancelled = true;
      };
   }, [leadId, token]);

   if (isLoading) {
      return (
         <Box
            sx={{
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center',
               justifyContent: 'center',
               gap: 2,
               minHeight: 320,
            }}
         >
            <CircularProgress />

            <Typography color="text.secondary">
               Загружаем информацию о лиде...
            </Typography>
         </Box>
      );
   }

   if (loadError || !lead) {
      return (
         <Alert severity="error">{loadError || LOAD_ERROR_MESSAGE}</Alert>
      );
   }

   const documents = Array.isArray(lead.documents) ? lead.documents : [];
   const { route, routePoints } = getSharedLeadRoute(lead);

   return (
      <Box>
         <Box
            sx={{
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'flex-start',
               gap: 2,
               flexWrap: 'wrap',
               mb: 2,
            }}
         >
            <Box>
               <Typography sx={{ fontSize: { xs: 18, sm: 20 }, fontWeight: 600 }}>
                  Информация о лиде
               </Typography>

               <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Лид #{lead.num || lead.id}
               </Typography>
            </Box>

            <LeadStatusChip status={lead.status} />
         </Box>

         <Alert severity="info" sx={{ mb: 2 }}>
            Это страница просмотра лида по ссылке. Редактирование недоступно.
         </Alert>

         <LeadDetailsMap
            map={map}
            lead={lead}
            route={route}
            routePoints={routePoints}
            geoPoints={geoPoints}
            geoCurrentPoint={geoCurrentPoint}
         />

         <Stack spacing={2}>
            <LeadRouteSection
               lead={lead}
               isEditing={false}
               editForm={{}}
               onEditChange={noop}
            />

            <LeadCargoSection
               lead={lead}
               isEditing={false}
               editForm={{}}
               onEditChange={noop}
               onDeleteCargo={noop}
            />

            <LeadForwarderSection
               lead={lead}
               isEditing={false}
               editForm={{}}
               onEditChange={noop}
            />

            <LeadDriverSection lead={lead} />

            {/* <DetailSection icon={<DescriptionOutlinedIcon />} title="Документы">
               {documents.length === 0 ? (
                  <Typography color="text.secondary" fontSize={14}>
                     Документы не добавлены
                  </Typography>
               ) : (
                  <Stack spacing={1}>
                     {documents.map((document) => (
                        <LeadDocumentCard
                           key={document.id}
                           document={{ ...document, source: 'public' }}
                           onOpen={setSelectedDocument}
                           onDelete={noop}
                        />
                     ))}
                  </Stack>
               )}
            </DetailSection> */}
         </Stack>

         {/* <DocumentPreviewDialog
            document={selectedDocument}
            onClose={() => setSelectedDocument(null)}
         /> */}
      </Box>
   );
}
