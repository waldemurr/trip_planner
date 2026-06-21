import type { Stop, StopType } from "../types";
import {
    FaMapPin,
    FaBox,
    FaFlagCheckered,
    FaGasPump,
    FaBed,
} from "react-icons/fa";

interface StopsTableProps {
    stops: Stop[];
}

const STOP_ICONS: Record<StopType, React.ReactNode> = {
    start: <FaMapPin size={16} color="#2196F3" />,
    pickup: <FaBox size={16} color="#4CAF50" />,
    dropoff: <FaFlagCheckered size={16} color="#F44336" />,
    fuel: <FaGasPump size={16} color="#FF9800" />,
    rest: <FaBed size={16} color="#9C27B0" />,
};

const STOP_LABELS: Record<StopType, string> = {
    start: "Start",
    pickup: "Pickup",
    dropoff: "Dropoff",
    fuel: "Fuel",
    rest: "Rest",
};

const STOP_COLORS: Record<StopType, string> = {
    start: "#2196F3",
    pickup: "#4CAF50",
    dropoff: "#F44336",
    fuel: "#FF9800",
    rest: "#9C27B0",
};

export const StopsTable: React.FC<StopsTableProps> = ({ stops }) => {
    const sorted = [...stops].sort((a, b) => a.sequence - b.sequence);

    if (!stops || stops.length === 0) {
        return (
            <div className="stops-table">
                <h2>Stops</h2>
                <p className="no-stops">No stops yet</p>
            </div>
        );
    }

    return (
        <div className="stops-table">
            <h2>Stops ({stops.length})</h2>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Type</th>
                        <th>Address</th>
                        <th>Coordinates</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((stop) => (
                        <tr key={stop.id}>
                            <td>{stop.sequence}</td>
                            <td>
                                <span
                                    className={`type-badge ${stop.stop_type}`}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        padding: "4px 10px",
                                        borderRadius: "20px",
                                        fontSize: "13px",
                                        fontWeight: "500",
                                        background: `${STOP_COLORS[stop.stop_type]}20`,
                                        color: STOP_COLORS[stop.stop_type],
                                        border: `1px solid ${STOP_COLORS[stop.stop_type]}40`,
                                    }}
                                >
                                    {STOP_ICONS[stop.stop_type]}
                                    {STOP_LABELS[stop.stop_type]}
                                </span>
                            </td>
                            <td>{stop.address}</td>
                            <td>
                                {stop.latitude.toFixed(4)},{" "}
                                {stop.longitude.toFixed(4)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <style>{`
                .stops-table {
                    background: #1e1e1e;
                    border-radius: 12px;
                    padding: 20px 24px;
                    border: 1px solid #333;
                }

                .stops-table h2 {
                    margin: 0 0 16px 0;
                    font-size: 18px;
                    color: #f5f5f5;
                    font-weight: 600;
                }

                .stops-table .no-stops {
                    color: #888;
                    text-align: center;
                    padding: 24px 0;
                    margin: 0;
                }

                .stops-table table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 14px;
                }

                .stops-table thead {
                    border-bottom: 2px solid #333;
                }

                .stops-table th {
                    text-align: left;
                    padding: 10px 8px;
                    color: #aaa;
                    font-weight: 600;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .stops-table td {
                    padding: 10px 8px;
                    color: #ddd;
                    border-bottom: 1px solid #2a2a2a;
                }

                .stops-table tbody tr:hover td {
                    background: #2a2a2a;
                }

                .stops-table tbody tr:last-child td {
                    border-bottom: none;
                }

                /* Scroll для таблицы на мобилках */
                @media (max-width: 600px) {
                    .stops-table {
                        padding: 16px;
                        overflow-x: auto;
                    }

                    .stops-table table {
                        font-size: 13px;
                        min-width: 400px;
                    }

                    .stops-table th,
                    .stops-table td {
                        padding: 8px 6px;
                    }
                }
            `}</style>
        </div>
    );
};