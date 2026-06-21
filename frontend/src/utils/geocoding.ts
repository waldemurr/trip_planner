export interface GeocodeResult {
    display_name: string;
    lat: number;
    lon: number;
    class: string;
    type: string;
}

export const searchLocations = async (query: string): Promise<GeocodeResult[]> => {
    if (!query || query.length < 2) {
        return [];
    }

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`
        );

        if (!response.ok) {
            throw new Error("Geocoding service error");
        }

        const data = await response.json();

        return data.map((item: any) => ({
            display_name: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            class: item.class,
            type: item.type,
        }));
    } catch (error) {
        console.error("Geocoding error:", error);
        return [];
    }
};