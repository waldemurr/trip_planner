import React, { useState } from "react";
import type { Trip, TripCreateRequest } from "../types";

interface TripFormProps {
    onTripCreated: (trip: Trip) => void;
}

export const TripForm: React.FC<TripFormProps> = ({ onTripCreated }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<TripCreateRequest>({
        current_location: "",
        pickup_location: "",
        dropoff_location: "",
        current_cycle_used_hours: 0,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // TODO: реализовать отправку
        console.log("Form submitted:", formData);
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} style={{ 
            background: "white", 
            padding: "24px", 
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
            <h3>Plan Your Trip</h3>
            
            <div style={{ display: "grid", gap: "16px" }}>
                <input
                    type="text"
                    placeholder="Current Location"
                    value={formData.current_location}
                    onChange={(e) => setFormData({...formData, current_location: e.target.value})}
                    style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
                    required
                />
                <input
                    type="text"
                    placeholder="Pickup Location"
                    value={formData.pickup_location}
                    onChange={(e) => setFormData({...formData, pickup_location: e.target.value})}
                    style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
                    required
                />
                <input
                    type="text"
                    placeholder="Dropoff Location"
                    value={formData.dropoff_location}
                    onChange={(e) => setFormData({...formData, dropoff_location: e.target.value})}
                    style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
                    required
                />
                <input
                    type="number"
                    placeholder="Current Cycle Used (hours)"
                    value={formData.current_cycle_used_hours}
                    onChange={(e) => setFormData({...formData, current_cycle_used_hours: Number(e.target.value)})}
                    style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
                    min="0"
                    max="70"
                    required
                />
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{
                        padding: "12px",
                        background: "#1a237e",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? "Planning..." : "Plan Trip"}
                </button>
            </div>
        </form>
    );
};