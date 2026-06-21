import React, { useState } from "react";
import { TripForm } from "./components/TripForm";
import { RouteMap } from "./components/RouteMap";
import { StopsTable } from "./components/StopsTable";
import { DailyLogs } from "./components/DailyLogs";
import { Trip } from "./types";

function App() {
    const [trip, setTrip] = useState<Trip | null>(null);

    return (
        <div className="app">
            <header>
                <h1>Trip Planner & ELD Logger</h1>
            </header>

            <main>
                <section className="form-section">
                    <TripForm onTripCreated={setTrip} />
                </section>

                {trip && (
                    <>
                        <section className="map-section">
                            <RouteMap stops={trip.stops} />
                        </section>

                        <section className="stops-section">
                            <StopsTable stops={trip.stops} />
                        </section>

                        <section className="logs-section">
                            <DailyLogs logs={trip.daily_logs} />
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

export default App;