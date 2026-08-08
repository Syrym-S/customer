import { Fragment } from 'react';
import { Marker, Polyline, Popup, Tooltip } from 'react-leaflet';

import { DriverMapInfo } from '../../../entities/driver/ui/DriverMapInfo';
import { formatLocation } from '../../../shared/lib/location/location.helpers';
import { driverMapIcon } from '../../../shared/ui/map/map-icons';

export function LeadGeoRoutesLayer({
    geoRoutes = [],
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

    return geoRoutes.map((geoRoute) => {
        const points = Array.isArray(geoRoute.points) ? geoRoute.points : [];

        const currentPoint = geoRoute.currentPoint;

        if (points.length === 0) {
            return null;
        }

        const { isSelected, isHighlighted, isDimmed } = getRouteViewState(
            geoRoute.id,
        );

        const leadNumber =
            geoRoute.lead?.num ?? geoRoute.lead?.id ?? geoRoute.id;

        const fromLocation = formatLocation(
            geoRoute.lead?.from_location,
            'Откуда не указано',
        );

        const toLocation = formatLocation(
            geoRoute.lead?.to_location,
            'Куда не указано',
        );

        return (
            <Fragment key={`geo-route-${geoRoute.id}`}>
                {points.length >= 2 && (
                    <Polyline
                        positions={points}
                        pathOptions={{
                            weight: isSelected ? 7 : isHighlighted ? 6 : 4,
                            opacity: isDimmed ? 0.18 : 0.95,
                            dashArray: '8 8',
                        }}
                        eventHandlers={{
                            click: () => {
                                onLeadClick?.(geoRoute.lead);
                            },
                        }}
                    >
                        <Tooltip sticky>
                            <div>
                                <b>Фактический путь лида #{leadNumber}</b>
                                <br />
                                {fromLocation} → {toLocation}
                                <DriverMapInfo driver={geoRoute.lead?.driver} />
                                <br />
                                Точек: {points.length}
                            </div>
                        </Tooltip>
                    </Polyline>
                )}

                {currentPoint && (
                    <Marker
                        position={currentPoint}
                        icon={driverMapIcon}
                        opacity={isDimmed ? 0.3 : 1}
                        eventHandlers={{
                            click: () => {
                                onLeadClick?.(geoRoute.lead);
                            },
                        }}
                    >
                        <Popup>
                            <strong>Текущая позиция водителя</strong>
                            <br />
                            Лид #{leadNumber}
                        </Popup>
                    </Marker>
                )}
            </Fragment>
        );
    });
}
