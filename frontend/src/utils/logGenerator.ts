import type { DailyLog, LogSegment } from "../types";
import { parseTime } from "./timeHelpers";

const SVG_WIDTH = 1000;
const SVG_HEIGHT = 420;
const MARGIN = { top: 50, right: 20, bottom: 50, left: 110 };
const GRID_WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
const GRID_HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;
const ROW_HEIGHT = GRID_HEIGHT / 4;
const HOUR_WIDTH = GRID_WIDTH / 24;

const STATUS_COLORS: Record<string, string> = {
    off: "#e0e0e0",
    sleeper: "#4CAF50",
    driving: "#2196F3",
    on: "#FF9800",
};

const STATUS_ROWS: Record<string, number> = {
    off: 0,
    sleeper: 1,
    driving: 2,
    on: 3,
};

const ROW_LABELS = ["OFF DUTY", "SLEEPER", "DRIVING", "ON DUTY"];

export const generateLogSheetSVG = (log: DailyLog): string => {
    const segments = log.segments || [];

    let svg = `<svg viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" xmlns="http://www.w3.org/2000/svg" class="eld-svg">`;

    svg += `<text x="${SVG_WIDTH / 2}" y="28" text-anchor="middle" font-size="18" font-weight="600" fill="#333">FMCSA Driver's Daily Log — ${log.date}</text>`;
    svg += `<rect x="${MARGIN.left}" y="${MARGIN.top}" width="${GRID_WIDTH}" height="${GRID_HEIGHT}" fill="#fff" stroke="#333" stroke-width="2"/>`;

    for (let i = 0; i <= 4; i++) {
        const y = MARGIN.top + i * ROW_HEIGHT;
        const strokeWidth = i === 0 || i === 4 ? 2 : 1;
        svg += `<line x1="${MARGIN.left}" y1="${y}" x2="${MARGIN.left + GRID_WIDTH}" y2="${y}" stroke="#333" stroke-width="${strokeWidth}"/>`;

        if (i < 4) {
            svg += `<text x="${MARGIN.left - 10}" y="${y + ROW_HEIGHT / 2 + 5}" text-anchor="end" font-size="13" font-weight="600" fill="#333">${ROW_LABELS[i]}</text>`;
        }
    }

    for (let h = 0; h <= 24; h++) {
        const x = MARGIN.left + h * HOUR_WIDTH;
        const isMajor = h % 2 === 0;
        const stroke = isMajor ? "#555" : "#ccc";
        const width = isMajor ? 1.5 : 0.5;
        svg += `<line x1="${x}" y1="${MARGIN.top}" x2="${x}" y2="${MARGIN.top + GRID_HEIGHT}" stroke="${stroke}" stroke-width="${width}"/>`;

        if (isMajor) {
            svg += `<text x="${x}" y="${MARGIN.top + GRID_HEIGHT + 22}" text-anchor="middle" font-size="12" fill="#333">${h}</text>`;
        }

        if (h < 24) {
            for (let q = 1; q <= 3; q++) {
                const tx = x + (q * HOUR_WIDTH) / 4;
                svg += `<line x1="${tx}" y1="${MARGIN.top + GRID_HEIGHT - 6}" x2="${tx}" y2="${MARGIN.top + GRID_HEIGHT}" stroke="#999" stroke-width="0.5"/>`;
            }
        }
    }

    segments.forEach((segment: LogSegment) => {
        const start = parseTime(segment.start_time);
        const end = parseTime(segment.end_time);
        let duration = end - start;
        if (duration <= 0) duration += 24;

        const row = STATUS_ROWS[segment.status] ?? 0;
        const x = MARGIN.left + start * HOUR_WIDTH;
        const y = MARGIN.top + row * ROW_HEIGHT;
        const width = duration * HOUR_WIDTH;
        const color = STATUS_COLORS[segment.status] || "#ccc";

        svg += `<rect x="${x}" y="${y}" width="${Math.max(width, 1)}" height="${ROW_HEIGHT}" fill="${color}" stroke="#222" stroke-width="0.5"/>`;
    });

    for (let h = 0; h <= 24; h += 2) {
        const x = MARGIN.left + h * HOUR_WIDTH;
        svg += `<text x="${x}" y="${MARGIN.top - 10}" text-anchor="middle" font-size="12" fill="#333">${String(h).padStart(2, "0")}:00</text>`;
    }

    svg += "</svg>";
    return svg;
};
