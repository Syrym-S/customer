import { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import { DetailsSkeleton } from '../../shared/ui/skeletons/DetailsSkeleton';
import { useParams } from 'react-router-dom';
import { Alert, Box, Stack, Typography } from '@mui/material';

import { useCustomerMap } from '../../widgets/customer-map/model/useCustomerMap';
import { LeadDetailsMap } from '../../widgets/customer-leads/ui/lead-details/LeadDetailsMap';
import { LeadRouteSection } from '../../widgets/customer-leads/ui/lead-details/sections/LeadRouteSection';
import { LeadCargoSection } from '../../widgets/customer-leads/ui/lead-details/sections/LeadCargoSection';
import { LeadTransportationSection } from '../../widgets/customer-leads/ui/lead-details/sections/LeadTransportationSection';
import { LeadForwarderSection } from '../../widgets/customer-leads/ui/lead-details/sections/LeadForwarderSection';
import { LeadDriverSection } from '../../widgets/customer-leads/ui/lead-details/sections/LeadDriverSection';
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

const LOAD_ERROR_KEY = 'sharedLead.invalidLink';

const LEAD_GONE_KEY = 'sharedLead.gone';

const REQUEST_ERROR_KEY = 'sharedLead.requestFailed';

function getLoadErrorKey(error) {
   const status = error?.response?.status;

   if (status === 404 || status === 410) {
      return LEAD_GONE_KEY;
   }

   if (status === 401 || status === 403) {
      return LOAD_ERROR_KEY;
   }

   return REQUEST_ERROR_KEY;
}

function getStraightLineRoutePoints(lead) {
   const fromPoint = getLocationPosition(lead?.raw?.from_location);
   const toPoint = getLocationPosition(lead?.raw?.to_location);

   const waypointPoints = Array.isArray(lead?.waypoints)
      ? lead.waypoints.map(getLocationPosition).filter(Boolean)
      : [];

   return [fromPoint, ...waypointPoints, toPoint].filter(Boolean);
}

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
   const { t, i18n } = useTranslation();

   // apiClient sends Accept-Language from i18n on every request, so the
   // backend-localized parts of the response (location names, cargo types)
   // are tied to whichever language was active when it was fetched. This page
   // is a single screen with no navigation to remount it, so the only way
   // those strings follow the header switcher is to refetch on change —
   // hence resolvedLanguage in the effect deps below.
   const language = i18n.resolvedLanguage || i18n.language;

   const { leadId, token } = useParams();
   const [lead, setLead] = useState(null);
   const [isLoading, setIsLoading] = useState(true);
   const [loadErrorKey, setLoadErrorKey] = useState('');

   const map = useCustomerMap();
   const { geoPoints, geoCurrentPoint } = useSharedLeadGeoTracking(lead);

   useEffect(() => {
      let isCancelled = false;

      async function loadSharedLead() {
         setIsLoading(true);
         setLoadErrorKey('');

         try {
            const response = await getSharedLeadApi(leadId, token);
            const nextLead = mapLeadDetailsResponseFromApi(response);

            if (isCancelled) {
               return;
            }

            if (nextLead?.id) {
               setLead(nextLead);
            } else {
               setLead(null);
               setLoadErrorKey(LEAD_GONE_KEY);
            }
         } catch (error) {
            console.error('Не удалось загрузить заказ по ссылке:', error);

            if (!isCancelled) {
               setLead(null);
               setLoadErrorKey(getLoadErrorKey(error));
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
   }, [leadId, token, language]);

   if (isLoading) {
      // Вместо спиннера показываем форму секций лида, которые
      // сейчас появятся.
      return <DetailsSkeleton sections={4} />;
   }

   if (loadErrorKey || !lead) {
      return (
         <Alert severity="error">{t(loadErrorKey || LOAD_ERROR_KEY)}</Alert>
      );
   }

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
                  {t("sharedLead.title")}
               </Typography>

               <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {t("leads.details.number", {
                     num: lead.num || lead.id,
                  })}
               </Typography>
            </Box>

            <LeadStatusChip lead={lead} />
         </Box>

         <Alert severity="info" sx={{ mb: 2 }}>
            {t("sharedLead.readOnly")}
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
               hidePrice
            />

            <LeadTransportationSection
               lead={lead}
               isEditing={false}
               editForm={{}}
               onEditChange={noop}
            />

            <LeadForwarderSection
               lead={lead}
               isEditing={false}
               editForm={{}}
               onEditChange={noop}
            />

            <LeadDriverSection lead={lead} hideDirectorFio />
         </Stack>
      </Box>
   );
}
