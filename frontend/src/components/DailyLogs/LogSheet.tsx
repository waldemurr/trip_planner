import type { DailyLog } from "../../types";
import { generateLogSheetSVG } from "../../utils/logGenerator";

interface LogSheetProps {
    log: DailyLog;
}

export const LogSheet: React.FC<LogSheetProps> = ({ log }) => {
    const svgContent = generateLogSheetSVG(log);

    return (
        <div className="log-sheet">
            <h4>FMCSA Log Sheet — {log.date}</h4>
            <div
                className="log-grid"
                dangerouslySetInnerHTML={{ __html: svgContent }}
            />
            <div className="log-summary">
                <span className="summary-driving">
                    D: {log.driving_hours.toFixed(1)}h
                </span>
                <span className="summary-on">
                    ON: {log.on_duty_hours.toFixed(1)}h
                </span>
                <span className="summary-off">
                    OFF: {log.off_duty_hours.toFixed(1)}h
                </span>
                <span className="summary-sleeper">
                    SLEEP: {log.sleeper_hours.toFixed(1)}h
                </span>
            </div>
        </div>
    );
};
