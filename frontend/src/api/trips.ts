import type { ApiError, Trip, TripCreateRequest } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export async function createTrip(payload: TripCreateRequest): Promise<Trip> {
    const response = await fetch(`${API_BASE_URL}/trips/create/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = (await response.json()) as Trip | ApiError;

    if (!response.ok) {
        const message =
            (data as ApiError).error ||
            `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return data as Trip;
}

export async function getTrip(id: number): Promise<Trip> {
    const response = await fetch(`${API_BASE_URL}/trips/${id}/`);
    const data = (await response.json()) as Trip | ApiError;

    if (!response.ok) {
        const message =
            (data as ApiError).error ||
            `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return data as Trip;
}
