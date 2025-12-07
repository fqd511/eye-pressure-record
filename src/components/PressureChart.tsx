/**
 * Interactive line chart for eye pressure visualization
 * Features: left/right/average lines, legend toggle, fullscreen mode
 * Supports time-proportional X axis for both 24h and regular measurements
 */

"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { ChartDataPoint } from "@/types";

interface PressureChartProps {
  data: ChartDataPoint[];
  title: string;
  is24h?: boolean; // Whether this is 24h measurement data
}

// Color scheme for the chart lines
const COLORS = {
  left: "#3b82f6", // blue-500
  right: "#ef4444", // red-500
  average: "#8b5cf6", // violet-500
};

// Normal pressure range
const NORMAL_MIN = 10;
const NORMAL_MAX = 21;

export default function PressureChart({ data, title, is24h = false }: PressureChartProps) {
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);
  const [showAverage, setShowAverage] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [useTimeScale, setUseTimeScale] = useState(true); // Toggle for time-proportional vs uniform X axis
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartWrapperRef = useRef<HTMLDivElement>(null);

  // Build a map from minutesFromStart to formatted label (using original dateStr)
  const labelMap = useMemo(() => {
    const map = new Map<number, string>();
    data.forEach((d) => {
      if (d.minutesFromStart !== undefined) {
        const date = new Date(d.dateStr);
        if (is24h) {
          // For 24h data, show time (HH:mm)
          const hours = date.getHours().toString().padStart(2, "0");
          const minutes = date.getMinutes().toString().padStart(2, "0");
          // Check if it's next day compared to first data point
          const firstDate = data[0] ? new Date(data[0].dateStr) : date;
          const dayDiff = date.getDate() !== firstDate.getDate();
          map.set(d.minutesFromStart, dayDiff ? `+1 ${hours}:${minutes}` : `${hours}:${minutes}`);
        } else {
          // For regular data, show date (MM/DD)
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const day = date.getDate().toString().padStart(2, "0");
          map.set(d.minutesFromStart, `${month}/${day}`);
        }
      }
    });
    return map;
  }, [data, is24h]);

  // Calculate Y axis domain based on data (min 0, max at least 40 or higher if data exceeds)
  const yAxisDomain = useMemo(() => {
    if (data.length === 0) return [0, 40];
    
    const allValues = data.flatMap(d => [d.left, d.right, d.average]);
    const maxValue = Math.max(...allValues);
    
    // Round up to nearest 5, minimum 40
    const yMax = Math.max(40, Math.ceil(maxValue / 5) * 5 + 5);
    
    return [0, yMax];
  }, [data]);

  // Generate Y axis ticks
  const yAxisTicks = useMemo(() => {
    const [, yMax] = yAxisDomain;
    const ticks: number[] = [];
    for (let i = 0; i <= yMax; i += 5) {
      ticks.push(i);
    }
    return ticks;
  }, [yAxisDomain]);

  // Calculate X axis ticks for time-scale mode
  const xAxisTicks = useMemo(() => {
    if (data.length === 0) return undefined;
    
    const minuteValues = data.map(d => d.minutesFromStart || 0);
    const maxMinutes = Math.max(...minuteValues);
    const ticks: number[] = [];
    
    if (is24h) {
      // For 24h data: every 2 hours (120 minutes)
      for (let m = 0; m <= maxMinutes + 60; m += 120) {
        ticks.push(m);
      }
    } else {
      // For regular data: use actual data points as ticks
      minuteValues.forEach(m => ticks.push(m));
    }
    
    return ticks;
  }, [is24h, data]);

  // X axis tick formatter - use labelMap for accurate labels
  const xAxisTickFormatter = useCallback((value: number) => {
    return labelMap.get(value) || "";
  }, [labelMap]);

  // Measure and update chart dimensions
  const updateDimensions = useCallback(() => {
    if (chartWrapperRef.current) {
      const rect = chartWrapperRef.current.getBoundingClientRect();
      const width = Math.max(rect.width - 32, 300);
      const height = isFullscreen ? window.innerHeight - 200 : 300;
      setDimensions({ width, height });
    }
  }, [isFullscreen]);

  // Update dimensions on mount and resize
  useEffect(() => {
    const timer = setTimeout(updateDimensions, 100);
    window.addEventListener("resize", updateDimensions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateDimensions);
    };
  }, [updateDimensions]);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      chartContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      setTimeout(updateDimensions, 100);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [updateDimensions]);

  // Handle mobile landscape orientation in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      // ScreenOrientation.lock is experimental, use type assertion
      const orientation = window.screen?.orientation as ScreenOrientation & {
        lock?: (orientation: string) => Promise<void>;
      };
      if (orientation?.lock) {
        orientation.lock("landscape").catch(() => {});
      }
    }
  }, [isFullscreen]);

  // Custom legend with clickable items
  const renderLegend = () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "12px",
        marginTop: "8px",
        marginBottom: "16px",
      }}
    >
      <button
        onClick={() => setShowLeft(!showLeft)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 12px",
          borderRadius: "9999px",
          fontSize: "14px",
          fontWeight: 500,
          border: showLeft ? "2px solid #3b82f6" : "none",
          backgroundColor: showLeft ? "#dbeafe" : "#f1f5f9",
          color: showLeft ? "#1d4ed8" : "#94a3b8",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: showLeft ? COLORS.left : "#cbd5e1",
          }}
        />
        左眼
      </button>
      <button
        onClick={() => setShowRight(!showRight)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 12px",
          borderRadius: "9999px",
          fontSize: "14px",
          fontWeight: 500,
          border: showRight ? "2px solid #ef4444" : "none",
          backgroundColor: showRight ? "#fee2e2" : "#f1f5f9",
          color: showRight ? "#b91c1c" : "#94a3b8",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: showRight ? COLORS.right : "#cbd5e1",
          }}
        />
        右眼
      </button>
      <button
        onClick={() => setShowAverage(!showAverage)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 12px",
          borderRadius: "9999px",
          fontSize: "14px",
          fontWeight: 500,
          border: showAverage ? "2px solid #8b5cf6" : "none",
          backgroundColor: showAverage ? "#ede9fe" : "#f1f5f9",
          color: showAverage ? "#6d28d9" : "#94a3b8",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: showAverage ? COLORS.average : "#cbd5e1",
          }}
        />
        均值
      </button>
      {/* X axis scale toggle */}
      <button
        onClick={() => setUseTimeScale(!useTimeScale)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          borderRadius: "9999px",
          fontSize: "13px",
          fontWeight: 500,
          border: "1px solid #cbd5e1",
          backgroundColor: useTimeScale ? "#fef3c7" : "#f1f5f9",
          color: useTimeScale ? "#92400e" : "#64748b",
          cursor: "pointer",
        }}
        title={useTimeScale ? "当前：按时间比例分布" : "当前：均匀分布"}
      >
        <svg
          style={{ width: "14px", height: "14px" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h7"
          />
        </svg>
        {useTimeScale ? "时间比例" : "均匀分布"}
      </button>
    </div>
  );

  return (
    <div
      ref={chartContainerRef}
      style={{
        position: "relative",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        border: "1px solid #e2e8f0",
        padding: isFullscreen ? "32px" : "16px",
        display: isFullscreen ? "flex" : "block",
        flexDirection: "column",
        height: isFullscreen ? "100vh" : "auto",
      }}
    >
      {/* Header with title and fullscreen button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#1e293b" }}>
          {title}
        </h3>
        <button
          onClick={toggleFullscreen}
          style={{
            padding: "8px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
          }}
          title={isFullscreen ? "退出全屏" : "全屏模式"}
        >
          {isFullscreen ? (
            <svg
              style={{ width: "20px", height: "20px", color: "#475569" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              style={{ width: "20px", height: "20px", color: "#475569" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Legend controls */}
      {renderLegend()}

      {/* Chart container with explicit dimensions */}
      <div
        ref={chartWrapperRef}
        style={{
          width: "100%",
          height: isFullscreen ? "calc(100% - 120px)" : "300px",
          minHeight: "300px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LineChart
          width={dimensions.width}
          height={dimensions.height}
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
        >
          <defs>
            <linearGradient id="safeZone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          {/* Safe zone background (10-21) */}
          <ReferenceArea
            y1={NORMAL_MIN}
            y2={NORMAL_MAX}
            fill="url(#safeZone)"
            fillOpacity={1}
          />

          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

          {/* Reference lines for normal range boundaries */}
          <ReferenceLine
            y={NORMAL_MIN}
            stroke="#22c55e"
            strokeDasharray="5 5"
            strokeWidth={1}
            label={{
              value: "正常下限",
              position: "right",
              fill: "#22c55e",
              fontSize: 11,
            }}
          />
          <ReferenceLine
            y={NORMAL_MAX}
            stroke="#f59e0b"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{
              value: "正常上限",
              position: "right",
              fill: "#f59e0b",
              fontSize: 11,
            }}
          />

          {/* X Axis: time-proportional or uniform based on toggle */}
          {useTimeScale ? (
            <XAxis
              dataKey="minutesFromStart"
              type="number"
              domain={["dataMin", "dataMax"]}
              ticks={xAxisTicks}
              tickFormatter={xAxisTickFormatter}
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={{ stroke: "#cbd5e1" }}
              axisLine={{ stroke: "#cbd5e1" }}
            />
          ) : (
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={{ stroke: "#cbd5e1" }}
              axisLine={{ stroke: "#cbd5e1" }}
            />
          )}

          <YAxis
            domain={yAxisDomain}
            tick={{ fontSize: 12, fill: "#64748b" }}
            tickLine={{ stroke: "#cbd5e1" }}
            axisLine={{ stroke: "#cbd5e1" }}
            ticks={yAxisTicks}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            labelFormatter={(value) => {
              // Use labelMap for accurate time display
              if (useTimeScale && typeof value === "number") {
                return labelMap.get(value) || value;
              }
              return value;
            }}
            formatter={(value: number, name: string) => [
              value.toFixed(2),
              name === "left" ? "左眼" : name === "right" ? "右眼" : "均值",
            ]}
          />
          <Legend content={() => null} />

          {showLeft && (
            <Line
              type="monotone"
              dataKey="left"
              stroke={COLORS.left}
              strokeWidth={2}
              dot={{ fill: COLORS.left, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: COLORS.left }}
              name="left"
            />
          )}

          {showRight && (
            <Line
              type="monotone"
              dataKey="right"
              stroke={COLORS.right}
              strokeWidth={2}
              dot={{ fill: COLORS.right, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: COLORS.right }}
              name="right"
            />
          )}

          {showAverage && (
            <Line
              type="monotone"
              dataKey="average"
              stroke={COLORS.average}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: COLORS.average, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: COLORS.average }}
              name="average"
            />
          )}
        </LineChart>
      </div>
    </div>
  );
}
