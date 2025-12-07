/**
 * Data grouping utilities for eye pressure records
 * Groups records by is24h flag and time proximity (30h window)
 */

import { EyePressureRecord, RecordGroup, ChartDataPoint } from "@/types";

const THIRTY_HOURS_MS = 30 * 60 * 60 * 1000;

// Group records by is24h and time proximity
// Order: regular records first, then 24h records (sorted by date)
export function groupRecords(records: EyePressureRecord[]): RecordGroup[] {
  // Separate 24h and regular records
  const records24h = records.filter((r) => r.is24h);
  const regularRecords = records.filter((r) => !r.is24h);

  const groups: RecordGroup[] = [];

  // Add regular records first
  if (regularRecords.length > 0) {
    const sorted = [...regularRecords].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    groups.push({
      id: "regular",
      title: "常规眼压测量",
      type: "regular",
      records: sorted,
    });
  }

  // Then add 24h records grouped by 30h proximity
  if (records24h.length > 0) {
    const sorted = [...records24h].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    let currentGroup: EyePressureRecord[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const timeDiff =
        new Date(sorted[i].date).getTime() -
        new Date(currentGroup[0].date).getTime();

      if (timeDiff <= THIRTY_HOURS_MS) {
        // Within 30h window, add to current group
        currentGroup.push(sorted[i]);
      } else {
        // Start new group
        groups.push(create24hGroup(currentGroup));
        currentGroup = [sorted[i]];
      }
    }

    // Add last group
    if (currentGroup.length > 0) {
      groups.push(create24hGroup(currentGroup));
    }
  }

  return groups;
}

// Create a 24h measurement group with title based on first date
function create24hGroup(records: EyePressureRecord[]): RecordGroup {
  const firstDate = new Date(records[0].date);
  const title = `24小时眼压 - ${formatDate(firstDate)}`;

  return {
    id: `24h-${firstDate.getTime()}`,
    title,
    type: "24h",
    records,
  };
}

// Format date for group title
function formatDate(date: Date): string {
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// Transform records to chart data points
export function toChartData(group: RecordGroup): ChartDataPoint[] {
  if (group.records.length === 0) return [];
  
  const firstDate = new Date(group.records[0].date);
  const firstTimestamp = firstDate.getTime();
  
  return group.records.map((record) => {
    const date = new Date(record.date);
    let label: string;
    let minutesFromStart: number;
    
    if (group.type === "24h") {
      // For 24h measurement, show time only (e.g., "08:00")
      // Add day indicator if different from first day (e.g., "+1 06:00")
      const timeStr = formatTime(date);
      if (date.getDate() !== firstDate.getDate()) {
        label = `+1 ${timeStr}`;
      } else {
        label = timeStr;
      }
      // Calculate minutes from start for time-proportional X axis
      minutesFromStart = Math.round((date.getTime() - firstTimestamp) / 60000);
    } else {
      // For regular data, use date label and calculate days from start
      label = formatDate(date);
      // Calculate days from start (in minutes for consistency, 1 day = 1440 minutes)
      minutesFromStart = Math.round((date.getTime() - firstTimestamp) / 60000);
    }
    
    return {
      label,
      left: record.left,
      right: record.right,
      average: (record.left + record.right) / 2,
      dateStr: record.date,
      minutesFromStart,
    };
  });
}

// Format time for 24h chart labels (HH:mm)
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}
