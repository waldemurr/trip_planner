import React from "react";
import type { DailyLog } from "../../types";
import { LogSheet } from "./LogSheet";

interface DailyLogsProps {
    logs: DailyLog[];
}

export const DailyLogs: React.FC<DailyLogsProps> = ({ logs }) => {
    return (
        <div className="daily-logs">
            <h2>Daily Log Sheets</h2>
            <div className="logs-grid">
                {logs.map((log, index) => (
                    <LogSheet key={index} log={log} />
                ))}
            </div>
        </div>
    );
};