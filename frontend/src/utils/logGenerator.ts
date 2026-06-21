import type { DailyLog, LogSegment } from "../types";

export const generateLogSheetSVG = (log: DailyLog): string => {
    const width = 800;
    const height = 400;
    const cellWidth = width / 24;
    const cellHeight = height / 4;

    const statusColors: Record<string, string> = {
        OFF: "#e0e0e0", 
        D: "#2196F3",
        ON: "#FF9800",
        R: "#4CAF50", 
    };
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    for (let i = 0; i <= 24; i++) {
        svg += `<line x1="${i * cellWidth}" y1="0" x2="${i * cellWidth}" y2="${height}" stroke="#ccc" stroke-width="0.5"/>`;
    }
    for (let i = 0; i <= 4; i++) {
        svg += `<line x1="0" y1="${i * cellHeight}" x2="${width}" y2="${i * cellHeight}" stroke="#ccc" stroke-width="0.5"/>`;
    }
    const statusRowMap: Record<string, number> = {
        OFF: 0,
        D: 1,
        ON: 2,
        R: 3,
    };
    log.segments.forEach((segment) => {
        const startHour = new Date(segment.start_time).getHours();
        const endHour = new Date(segment.end_time).getHours();
        const duration = endHour - startHour;

        const row = statusRowMap[segment.status] || 0;
        const x = startHour * cellWidth;
        const y = row * cellHeight;
        const w = duration * cellWidth;
        const h = cellHeight;

        svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${statusColors[segment.status] || "#fff"}" stroke="#333" stroke-width="1"/>`;
        svg += `<text x="${x + 4}" y="${y + 20}" font-size="10" fill="#000">${segment.status}</text>`;
    });
    const rowLabels = ["OFF", "D", "ON", "R"];
    rowLabels.forEach((label, i) => {
        svg += `<text x="5" y="${i * cellHeight + 20}" font-size="12" font-weight="bold" fill="#333">${label}</text>`;
    });

    for (let i = 0; i <= 24; i++) {
        svg += `<text x="${i * cellWidth - 8}" y="${height - 5}" font-size="8" fill="#666">${i}</text>`;
    }

    svg += "</svg>";

    return svg;
};