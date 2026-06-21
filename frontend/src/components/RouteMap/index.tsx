import React from "react";
import type { Stop } from "../../types";

interface RouteMapProps {
    stops: Stop[];
}

export const RouteMap: React.FC<RouteMapProps> = ({ stops }) => {
    return (
        <div style={{
            background: "#f5f5f5",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
            minHeight: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <p style={{ color: "#666" }}>
                {stops.length > 0 
                    ? `Route with ${stops.length} stops (map integration coming soon)` 
                    : "No route to display"}
            </p>
        </div>
    );
};