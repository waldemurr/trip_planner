export const parseTime = (time: string): number => {
    const parts = time.split(":");
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    return hours + minutes / 60;
};

export const formatHours = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const isValidTime = (time: string): boolean => {
    return /^\d{2}:\d{2}:\d{2}$/.test(time);
};