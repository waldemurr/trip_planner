import React from "react";
import type { DailyLog } from "../../types";
import { generateLogSheetSVG } from "../../utils/logGenerator";

interface LogSheetProps {
    log: DailyLog;
}

export const LogSheet: React.FC<LogSheetProps> = ({ log }) => {
    const svgContent = generateLogSheetSVG(log);

    return (
        <div className="log-sheet">
            <h4>Date: {log.date}</h4>
            <div className="log-grid">
                <div dangerouslySetInnerHTML={{ __html: svgContent }} />
            </div>
            <div className="log-summary">
                <span>Driving: {log.driving_hours}h</span>
                <span>On Duty: {log.on_duty_hours}h</span>
                <span>Off Duty: {log.off_duty_hours}h</span>
                <span>Sleeper: {log.sleeper_hours}h</span>
            </div>
        </div>
    );
};