import React from "react";
import type { Stop } from "../types";

interface StopsTableProps {
    stops: Stop[];
}

export const StopsTable: React.FC<StopsTableProps> = ({ stops }) => {
    if (!stops || stops.length === 0) {
        return <p style={{ color: "#666" }}>No stops</p>;
    }

    return (
        <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ background: "#f5f5f5" }}>
                        <th style={{ padding: "10px", textAlign: "left" }}>#</th>
                        <th style={{ padding: "10px", textAlign: "left" }}>Type</th>
                        <th style={{ padding: "10px", textAlign: "left" }}>Address</th>
                        <th style={{ padding: "10px", textAlign: "left" }}>Coordinates</th>
                    </tr>
                </thead>
                <tbody>
                    {stops.map((stop, index) => (
                        <tr key={stop.id} style={{ borderBottom: "1px solid #eee" }}>
                            <td style={{ padding: "10px" }}>{index + 1}</td>
                            <td style={{ padding: "10px" }}>
                                <span style={{
                                    display: "inline-block",
                                    padding: "2px 10px",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    background: stop.stop_type === "pickup" ? "#4CAF50" : 
                                               stop.stop_type === "dropoff" ? "#F44336" : "#FF9800",
                                    color: "white"
                                }}>
                                    {stop.stop_type}
                                </span>
                            </td>
                            <td style={{ padding: "10px" }}>{stop.address}</td>
                            <td style={{ padding: "10px" }}>
                                {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};