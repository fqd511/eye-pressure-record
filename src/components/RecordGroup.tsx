/**
 * Record group component combining table and chart
 * Displays one group of eye pressure measurements
 */

"use client";

import { useState } from "react";
import { RecordGroup as RecordGroupType } from "@/types";
import { toChartData } from "@/lib/grouping";
import DataTable from "./DataTable";
import PressureChart from "./PressureChart";

interface RecordGroupProps {
  group: RecordGroupType;
}

export default function RecordGroup({ group }: RecordGroupProps) {
  const [view, setView] = useState<"chart" | "table" | "both">("both");
  const chartData = toChartData(group);

  const buttonStyle = (isActive: boolean) => ({
    padding: "6px 12px",
    fontSize: "14px",
    fontWeight: 500,
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    backgroundColor: isActive ? "white" : "transparent",
    color: isActive ? "#0f172a" : "#64748b",
    boxShadow: isActive ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
  });

  return (
    <div style={{ marginBottom: "32px" }}>
      {/* Group header with view toggle */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
          {group.title}
        </h2>

        {/* View toggle buttons */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            padding: "4px",
            backgroundColor: "#f1f5f9",
            borderRadius: "8px",
          }}
        >
          <button onClick={() => setView("chart")} style={buttonStyle(view === "chart")}>
            图表
          </button>
          <button onClick={() => setView("table")} style={buttonStyle(view === "table")}>
            表格
          </button>
          <button onClick={() => setView("both")} style={buttonStyle(view === "both")}>
            全部
          </button>
        </div>
      </div>

      {/* Content based on view selection */}
      <div
        style={{
          display: "grid",
          gap: "24px",
          gridTemplateColumns: view === "both" ? "repeat(auto-fit, minmax(400px, 1fr))" : "1fr",
        }}
      >
        {(view === "chart" || view === "both") && (
          <div style={view === "both" ? {} : { maxWidth: "900px", margin: "0 auto", width: "100%" }}>
            <PressureChart data={chartData} title="眼压趋势" is24h={group.type === "24h"} />
          </div>
        )}
        {(view === "table" || view === "both") && (
          <div style={view === "both" ? {} : { maxWidth: "900px", margin: "0 auto", width: "100%" }}>
            <DataTable records={group.records} type={group.type} />
          </div>
        )}
      </div>
    </div>
  );
}
