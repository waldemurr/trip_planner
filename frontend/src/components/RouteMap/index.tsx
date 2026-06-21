import { useEffect } from "react";
import {
    MapContainer,
    Marker,
    Polyline,
    Popup,
    TileLayer,
    useMap,
} from "react-leaflet";
import { Icon, latLngBounds, type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Stop } from "../../types";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import markerIconRetina from "leaflet/dist/images/marker-icon-2x.png";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIconRetina,
    shadowUrl: markerShadow,
});

interface RouteMapProps {
    stops: Stop[];
    routeGeometry?: [number, number][];
    currentLocation?: { lat: number; lng: number };
    className?: string;
    height?: string | number;
}

const MapController: React.FC<{ positions: LatLngExpression[] }> = ({
    positions,
}) => {
    const map = useMap();

    useEffect(() => {
        if (positions.length === 0) return;

        if (positions.length === 1) {
            map.setView(positions[0], 10);
            return;
        }

        map.fitBounds(latLngBounds(positions), { padding: [50, 50] });
    }, [map, positions]);

    return null;
};

const createCustomIcon = (color: string, label: string): Icon => {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="rgba(0,0,0,0.2)" transform="translate(1, 2)"/>
            <circle cx="18" cy="17" r="15" fill="${color}" stroke="white" stroke-width="2.5"/>
            <circle cx="18" cy="17" r="11" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
            <text x="18" y="22" font-size="14" fill="white" text-anchor="middle" font-weight="bold" font-family="Arial, sans-serif">
                ${label}
            </text>
            <circle cx="18" cy="33" r="2" fill="${color}" stroke="white" stroke-width="1"/>
        </svg>
    `;
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

    return new Icon({
        iconUrl: url,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
    });
};

const currentLocationIcon = new Icon({
    iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" fill="#1976D2" stroke="white" stroke-width="2"/>
            <circle cx="10" cy="10" r="3" fill="white"/>
        </svg>
    `)}`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

const STOP_COLORS: Record<string, { color: string; label: string }> = {
    start: { color: "#757575", label: "S" },
    pickup: { color: "#4CAF50", label: "P" },
    dropoff: { color: "#F44336", label: "D" },
    fuel: { color: "#FF9800", label: "F" },
    rest: { color: "#9C27B0", label: "R" },
};

export const RouteMap: React.FC<RouteMapProps> = ({
    stops,
    routeGeometry,
    currentLocation,
    className = "",
    height = "500px",
}) => {
    if (!stops || stops.length === 0) {
        return (
            <div
                className={`route-map-placeholder ${className}`}
                style={{
                    background: "#f5f5f5",
                    padding: "40px",
                    borderRadius: "8px",
                    textAlign: "center",
                    minHeight:
                        typeof height === "number" ? `${height}px` : height,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                }}
            >
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🗺️</div>
                <p style={{ color: "#666", margin: 0 }}>
                    Enter trip details to see the route
                </p>
            </div>
        );
    }

    const routeCoordinates: LatLngExpression[] = routeGeometry?.length
        ? routeGeometry
        : stops.map((stop) => [stop.latitude, stop.longitude] as [number, number]);

    const stopPositions: LatLngExpression[] = stops.map(
        (stop) => [stop.latitude, stop.longitude] as [number, number]
    );

    const allPositions: LatLngExpression[] = [];
    if (currentLocation) {
        allPositions.push([currentLocation.lat, currentLocation.lng]);
    }
    allPositions.push(...stopPositions);

    const center =
        allPositions.length > 0
            ? allPositions[0]
            : ([39.8283, -98.5795] as [number, number]);

    const getIconForStop = (stop: Stop): Icon => {
        const config = STOP_COLORS[stop.stop_type] || {
            color: "#757575",
            label: "?",
        };
        return createCustomIcon(config.color, config.label);
    };

    const formatCoordinate = (lat: number, lng: number): string => {
        return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    };

    const heightValue =
        typeof height === "number" ? `${height}px` : height;

    return (
        <div
            className={`route-map-container ${className}`}
            style={{ position: "relative" }}
        >
            <MapContainer
                style={{
                    height: heightValue,
                    width: "100%",
                    borderRadius: "8px",
                }}
                zoom={6}
                center={center}
                scrollWheelZoom
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapController positions={allPositions} />

                {currentLocation && (
                    <Marker
                        position={[currentLocation.lat, currentLocation.lng]}
                        icon={currentLocationIcon}
                    >
                        <Popup>
                            <div style={{ fontWeight: "bold" }}>
                                📍 Current Location
                            </div>
                            <div
                                style={{ fontSize: "12px", color: "#666" }}
                            >
                                {formatCoordinate(
                                    currentLocation.lat,
                                    currentLocation.lng
                                )}
                            </div>
                        </Popup>
                    </Marker>
                )}

                {stops.map((stop, index) => {
                    const position: LatLngExpression = [
                        stop.latitude,
                        stop.longitude,
                    ];
                    const icon = getIconForStop(stop);

                    return (
                        <Marker
                            key={`${stop.id}-${index}`}
                            position={position}
                            icon={icon}
                        >
                            <Popup>
                                <div style={{ minWidth: "150px" }}>
                                    <div
                                        style={{
                                            fontWeight: "bold",
                                            fontSize: "16px",
                                            marginBottom: "4px",
                                        }}
                                    >
                                        {stop.stop_type.toUpperCase()}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "13px",
                                            color: "#333",
                                            marginBottom: "2px",
                                        }}
                                    >
                                        📍 {stop.address}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "11px",
                                            color: "#666",
                                        }}
                                    >
                                        {formatCoordinate(
                                            stop.latitude,
                                            stop.longitude
                                        )}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "11px",
                                            color: "#999",
                                            marginTop: "4px",
                                        }}
                                    >
                                        Stop #{index + 1}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {routeCoordinates.length > 1 && (
                    <Polyline
                        positions={routeCoordinates}
                        pathOptions={{
                            color: "#2196F3",
                            weight: 4,
                            opacity: 0.9,
                        }}
                    />
                )}
            </MapContainer>

            <div
                style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "20px",
                    background: "rgba(255,255,255,0.95)",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    fontSize: "12px",
                    zIndex: 1000,
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                    }}
                >
                    <span
                        style={{
                            display: "inline-block",
                            width: "12px",
                            height: "12px",
                            background: "#4CAF50",
                            borderRadius: "50%",
                        }}
                    ></span>
                    <span>Pickup</span>
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                    }}
                >
                    <span
                        style={{
                            display: "inline-block",
                            width: "12px",
                            height: "12px",
                            background: "#F44336",
                            borderRadius: "50%",
                        }}
                    ></span>
                    <span>Dropoff</span>
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                    }}
                >
                    <span
                        style={{
                            display: "inline-block",
                            width: "12px",
                            height: "12px",
                            background: "#FF9800",
                            borderRadius: "50%",
                        }}
                    ></span>
                    <span>Fuel</span>
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                    }}
                >
                    <span
                        style={{
                            display: "inline-block",
                            width: "12px",
                            height: "12px",
                            background: "#9C27B0",
                            borderRadius: "50%",
                        }}
                    ></span>
                    <span>Rest</span>
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                    }}
                >
                    <span
                        style={{
                            display: "inline-block",
                            width: "20px",
                            height: "3px",
                            background: "#2196F3",
                        }}
                    ></span>
                    <span>Route</span>
                </div>
            </div>
        </div>
    );
};
