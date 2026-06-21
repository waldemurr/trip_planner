export type LogStatus = "off" | "sleeper" | "driving" | "on";

export interface LogSegment {
    status: LogStatus;
    start_time: string;  // "08:30:00"
    end_time: string;    // "17:00:00"
}

export interface DailyLog {
    date: string;
    driving_hours: number;
    on_duty_hours: number;
    off_duty_hours: number;
    sleeper_hours: number;
    segments: LogSegment[];
}

export interface Stop {
    id: number;
    stop_type: "pickup" | "dropoff" | "fuel" | "rest";
    address: string;
    latitude: number;
    longitude: number;
    sequence: number;
}

export interface Trip {
    id: number;
    current_cycle_used_hours: number;
    created_at: string;
    stops: Stop[];
    daily_logs: DailyLog[];
}

export interface TripCreateRequest {
    current_location: string;
    pickup_location: string;
    dropoff_location: string;
    current_cycle_used_hours: number;
}