import { useState } from "react";
import { createTrip } from "../api/trips";
import type { Trip, TripCreateRequest } from "../types";
import { LocationInput } from "./LocationInput";

interface TripFormProps {
    onTripCreated: (trip: Trip) => void;
}

interface Coordinates {
    lat: number;
    lng: number;
}

export const TripForm: React.FC<TripFormProps> = ({ onTripCreated }) => {
    const [form, setForm] = useState<TripCreateRequest>({
        current_location: "",
        pickup_location: "",
        dropoff_location: "",
        current_cycle_used_hours: 0,
    });

    const [coords, setCoords] = useState<{
        current_location?: Coordinates;
        pickup_location?: Coordinates;
        dropoff_location?: Coordinates;
    }>({});

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const handleLocationChange = (
        field: keyof Pick<TripCreateRequest, "current_location" | "pickup_location" | "dropoff_location">,
        value: string,
        coordinates?: Coordinates
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (coordinates) {
            setCoords((prev) => ({ ...prev, [field]: coordinates }));
        }
        setErrors((prev) => ({ ...prev, [field]: "" }));
        setApiError(null);
    };

    const handleCycleChange = (value: string) => {
        setForm((prev) => ({
            ...prev,
            current_cycle_used_hours: Number(value),
        }));
        setErrors((prev) => ({ ...prev, current_cycle_used_hours: "" }));
        setApiError(null);
    };

    const validate = (): boolean => {
        const nextErrors: Record<string, string> = {};

        if (!form.current_location.trim()) {
            nextErrors.current_location = "Current location is required";
        } else if (!coords.current_location) {
            nextErrors.current_location = "Please select a valid location from the suggestions";
        }

        if (!form.pickup_location.trim()) {
            nextErrors.pickup_location = "Pickup location is required";
        } else if (!coords.pickup_location) {
            nextErrors.pickup_location = "Please select a valid location from the suggestions";
        }

        if (!form.dropoff_location.trim()) {
            nextErrors.dropoff_location = "Dropoff location is required";
        } else if (!coords.dropoff_location) {
            nextErrors.dropoff_location = "Please select a valid location from the suggestions";
        }

        if (
            Number.isNaN(form.current_cycle_used_hours) ||
            form.current_cycle_used_hours < 0 ||
            form.current_cycle_used_hours > 70
        ) {
            nextErrors.current_cycle_used_hours = "Cycle used hours must be between 0 and 70";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setApiError(null);

        try {
            const trip = await createTrip(form);
            onTripCreated(trip);
        } catch (err) {
            setApiError(
                err instanceof Error
                    ? err.message
                    : "An unexpected error occurred"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="trip-form" onSubmit={handleSubmit} noValidate>
            <h2>Plan a Trip</h2>

            <LocationInput
                id="current_location"
                label="Current Location"
                value={form.current_location}
                onChange={(value, coords) =>
                    handleLocationChange("current_location", value, coords)
                }
                placeholder="e.g. New York, NY"
                disabled={loading}
                required
                error={errors.current_location}
            />

            <LocationInput
                id="pickup_location"
                label="Pickup Location"
                value={form.pickup_location}
                onChange={(value, coords) =>
                    handleLocationChange("pickup_location", value, coords)
                }
                placeholder="e.g. Philadelphia, PA"
                disabled={loading}
                required
                error={errors.pickup_location}
            />

            <LocationInput
                id="dropoff_location"
                label="Dropoff Location"
                value={form.dropoff_location}
                onChange={(value, coords) =>
                    handleLocationChange("dropoff_location", value, coords)
                }
                placeholder="e.g. Boston, MA"
                disabled={loading}
                required
                error={errors.dropoff_location}
            />

            <div className="form-group">
                <label htmlFor="current_cycle_used_hours">
                    Current Cycle Used Hours: {form.current_cycle_used_hours}h
                </label>
                <div className="cycle-input-group">
                    <input
                        id="current_cycle_used_hours"
                        type="range"
                        min={0}
                        max={70}
                        step={0.5}
                        value={form.current_cycle_used_hours}
                        onChange={(e) => handleCycleChange(e.target.value)}
                        disabled={loading}
                    />
                    <input
                        type="number"
                        min={0}
                        max={70}
                        step={0.5}
                        value={form.current_cycle_used_hours}
                        onChange={(e) => handleCycleChange(e.target.value)}
                        disabled={loading}
                    />
                </div>
                {errors.current_cycle_used_hours && (
                    <span className="error">{errors.current_cycle_used_hours}</span>
                )}
            </div>

            {apiError && <div className="api-error">{apiError}</div>}

            <button type="submit" disabled={loading}>
                {loading ? (
                    <>
                        <span className="spinner" />
                        Planning...
                    </>
                ) : (
                    "Plan Trip"
                )}
            </button>

            <style>{`
                .trip-form {
                    background: #1e1e1e;
                    color: #f5f5f5;
                    padding: 24px 28px;
                    border-radius: 12px;
                    border: 1px solid #2e2e2e;
                }

                .trip-form h2 {
                    margin: 0 0 20px;
                    color: #8ea2ff;
                }

                .trip-form .form-group {
                    margin-bottom: 16px;
                }

                .trip-form .form-group label {
                    display: block;
                    margin-bottom: 6px;
                    color: #d0d0d0;
                    font-size: 14px;
                    font-weight: 500;
                }

                .trip-form input {
                    width: 100%;
                    box-sizing: border-box;

                    background: #2a2a2a;
                    color: #f5f5f5;

                    border: 1px solid #444;
                    border-radius: 8px;

                    padding: 10px 12px;

                    font-size: 14px;
                }

                .trip-form input::placeholder {
                    color: #888;
                }

                .trip-form input:focus {
                    outline: none;
                    border-color: #8ea2ff;
                    box-shadow: 0 0 0 3px rgba(142, 162, 255, 0.15);
                }
            `}</style>
        </form>
    );
};