/**
 * Type definitions for eye pressure record application
 * Contains interfaces for raw Notion data and processed display data
 */

// Raw record from Notion database
export interface EyePressureRecord {
  id: string;
  name: string;
  date: string; // ISO string for serialization between server/client
  left: number;
  right: number;
  is24h: boolean;
  note: string;
}

// Grouped records for display
export interface RecordGroup {
  id: string;
  title: string;
  type: "24h" | "regular";
  records: EyePressureRecord[];
}

// Chart data point
export interface ChartDataPoint {
  label: string;
  left: number;
  right: number;
  average: number;
  dateStr: string;
  // Minutes from first data point (for time-based X axis in 24h charts)
  minutesFromStart?: number;
}
