import { Fragment } from 'react';
import { Marker, Polyline, Popup, Tooltip } from 'react-leaflet';

import { DriverMapInfo } from '../../../entities/driver/ui/DriverMapInfo';
import { formatLocation } from '../../../shared/lib/location/location.helpers';
import { buildLeadRouteMarkers } from '../lib/lead-route-markers.helpers';

export function LeadRoutesLayer({
    routes = [],
    selectedLeadId,
    activeHighlightedLeadId,
    hasHighlightedRoute = false,
    onLeadClick,
}) {
    function getRouteViewState(routeId) {
        const isSelected = String(routeId) === String(selectedLeadId);

        const isHighlighted =
            String(routeId) === String(activeHighlightedLeadId);

        const isDimmed = hasHighlightedRoute && !isHighlighted;

        return {
            isSelected,
            isHighlighted,
            isDimmed,
        };
    }

    return routes.map((mapRoute, index) => {
        if (!mapRoute.points || mapRoute.points.length < 2) {
            return null;
        }

        const { isSelected, isHighlighted, isDimmed } = getRouteViewState(
            mapRoute.id,
        );

        const fromLocation = formatLocation(
            mapRoute.lead?.from_location,
            'Откуда не указано',
        );

        const toLocation = formatLocation(
            mapRoute.lead?.to_location,
            'Куда не указано',
        );

        const routeMarkers = buildLeadRouteMarkers(
            mapRoute.lead,
            mapRoute.points,
        );

        return (
            <Fragment key={mapRoute.id}>
                <Polyline
                    positions={mapRoute.points}
                    pathOptions={{
                        weight: isSelected
                            ? 7
                            : isHighlighted
                              ? 6
                              : index === 0
                                ? 5
                                : 4,
                        opacity: isDimmed
                            ? 0.18
                            : isHighlighted
                              ? 0.95
                              : index === 0
                                ? 0.9
                                : 0.65,
                    }}
                    eventHandlers={{
                        click: () => {
                            onLeadClick?.(mapRoute.lead);
                        },
                    }}
                >
                    <Tooltip sticky>
                        <div>
                            <b>
                                Лид #{mapRoute.lead?.num ?? mapRoute.lead?.id}
                            </b>
                            <br />
                            {fromLocation} → {toLocation}
                            <DriverMapInfo driver={mapRoute.lead?.driver} />
                            {mapRoute.route?.distanceMeters && (
                                <>
                                    <br />
                                    {(
                                        mapRoute.route.distanceMeters / 1000
                                    ).toFixed(1)}{' '}
                                    км
                                </>
                            )}
                        </div>
                    </Tooltip>
                </Polyline>

                {routeMarkers.map((marker) => (
                    <Marker
                        key={marker.id}
                        position={marker.position}
                        opacity={isDimmed ? 0.3 : 1}
                        eventHandlers={{
                            click: () => {
                                onLeadClick?.(mapRoute.lead);
                            },
                        }}
                    >
                        <Popup>
                            <strong>{marker.title}</strong>
                            <br />
                            Лид #{mapRoute.lead?.num ?? mapRoute.lead?.id}
                            <br />
                            {marker.description}
                        </Popup>
                    </Marker>
                ))}
            </Fragment>
        );
    });
}
