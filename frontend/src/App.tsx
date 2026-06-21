import { useState } from "react";
import "./App.css";
import { DailyLogs } from "./components/DailyLogs";
import { RouteMap } from "./components/RouteMap";
import { StopsTable } from "./components/StopsTable";
import { TripForm } from "./components/TripForm";
import type { Trip } from "./types";

function App() {
    const [trip, setTrip] = useState<Trip | null>(null);

    return (
        <div className="app">
            <header>
                <h1>Trip Planner & ELD Logger</h1>
                <p className="subtitle">
                    Plan routes, schedule stops, and generate FMCSA daily log
                    sheets.
                </p>
            </header>

            <main>
                <section className="form-section">
                    <TripForm onTripCreated={setTrip} />
                </section>

                {trip && (
                    <>
                        <section className="trip-summary fade-in">
                            <div className="stat">
                                <span className="stat-value">
                                    {trip.total_distance_miles.toFixed(1)} mi
                                </span>
                                <span className="stat-label">Distance</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">
                                    {trip.total_duration_hours.toFixed(1)} h
                                </span>
                                <span className="stat-label">Drive Time</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">
                                    {trip.daily_logs.length}
                                </span>
                                <span className="stat-label">Days</span>
                            </div>
                        </section>

                        <section className="map-section fade-in">
                            <RouteMap
                                stops={trip.stops}
                                routeGeometry={trip.route_geometry}
                            />
                        </section>

                        <section className="stops-section fade-in">
                            <StopsTable stops={trip.stops} />
                        </section>

                        <section className="logs-section fade-in">
                            <DailyLogs logs={trip.daily_logs} />
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

export default App;
