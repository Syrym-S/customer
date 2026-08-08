import {
    MapContainer,
    Marker,
    Polyline,
    Popup,
    TileLayer,
    Tooltip,
} from 'react-leaflet';

import { MAP_TILE_LAYER } from '../../config/map.config';
import { FitMapBounds } from './FitMapBounds';
import { MapClickHandler } from './MapClickHandler';
import { MapResizeHandler } from './MapResizeHandler';

export function MapView({
    center,
    zoom,
    markers = [],
    routePoints = [],
    route = null,
    routes = [],
    geoRoutes = [],
    geoRoutePoints = [],
    fitBoundsKey = '',
    fitBoundsPoints = [],
    onMapClick,
    onMarkerClick,
    onMarkerDragEnd,
    children,
}) {
    const routesPointsCount = routes.reduce(
        (count, item) => count + (item.points?.length || 0),
        0,
    );

    const geoRoutesPointsCount = geoRoutes.reduce(
        (count, item) => count + (item.points?.length || 0),
        0,
    );

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom
            style={{
                width: '100%',
                height: '100%',
            }}
        >
            <MapResizeHandler
                center={center}
                zoom={zoom}
                markersCount={markers.length}
                routePointsCount={
                    routePoints.length +
                    geoRoutePoints.length +
                    routesPointsCount +
                    geoRoutesPointsCount
                }
            />

            <FitMapBounds
                routePoints={routePoints}
                geoRoutePoints={geoRoutePoints}
                routes={routes}
                geoRoutes={geoRoutes}
                markers={markers}
                fitBoundsKey={fitBoundsKey}
                fitBoundsPoints={fitBoundsPoints}
            />

            <MapClickHandler onMapClick={onMapClick} />

            <TileLayer
                attribution={MAP_TILE_LAYER.attribution}
                url={MAP_TILE_LAYER.url}
            />

            {routePoints.length >= 2 && (
                <Polyline
                    positions={routePoints}
                    pathOptions={{
                        weight: 5,
                        opacity: 0.9,
                    }}
                >
                    <Tooltip sticky>
                        <div>
                            <b>Маршрут</b>

                            {route?.distanceMeters && (
                                <>
                                    <br />
                                    {(route.distanceMeters / 1000).toFixed(
                                        1,
                                    )}{' '}
                                    км
                                </>
                            )}

                            {route?.duration && (
                                <>
                                    <br />
                                    {Math.round(
                                        Number.parseInt(route.duration, 10) /
                                            60,
                                    )}{' '}
                                    мин
                                </>
                            )}
                        </div>
                    </Tooltip>
                </Polyline>
            )}

            {geoRoutePoints.length >= 2 && (
                <Polyline
                    positions={geoRoutePoints}
                    pathOptions={{
                        weight: 4,
                        opacity: 0.95,
                        dashArray: '8 8',
                    }}
                />
            )}

            {markers.map((marker) => (
                <Marker
                    key={marker.id}
                    position={marker.position}
                    draggable={Boolean(marker.draggable)}
                    icon={marker.icon}
                    eventHandlers={{
                        click: () => onMarkerClick?.(marker),
                        dragend: (event) => {
                            if (!onMarkerDragEnd) {
                                return;
                            }

                            onMarkerDragEnd(marker, event.target.getLatLng());
                        },
                    }}
                >
                    {(marker.title || marker.description) && (
                        <Popup>
                            {marker.title && (
                                <>
                                    <strong>{marker.title}</strong>
                                    <br />
                                </>
                            )}

                            {marker.description}
                        </Popup>
                    )}
                </Marker>
            ))}

            {children}
        </MapContainer>
    );
}
