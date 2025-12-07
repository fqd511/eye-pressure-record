/**
 * Data table component for displaying eye pressure records
 * Shows all fields in a scrollable table format
 */

"use client";

import { EyePressureRecord } from "@/types";

interface DataTableProps {
  records: EyePressureRecord[];
  type: "24h" | "regular";
}

export default function DataTable({ records, type }: DataTableProps) {
  // Format date based on group type
  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (type === "24h") {
      return d.toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return d.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Get color for value (>21 high, >18 warning)
  const getValueColor = (value: number) => {
    if (value > 21) return "#dc2626";
    if (value > 18) return "#d97706";
    return "#059669";
  };

  const thStyle = {
    padding: "12px 16px",
    textAlign: "left" as const,
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: "#475569",
    backgroundColor: "#f8fafc",
  };

  const tdStyle = {
    padding: "12px 16px",
    fontSize: "14px",
    whiteSpace: "nowrap" as const,
  };

  return (
    <div
      style={{
        overflowX: "auto",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        backgroundColor: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <table
        style={{
          minWidth: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
            <th style={thStyle}>{type === "24h" ? "时间" : "日期"}</th>
            <th style={{ ...thStyle, textAlign: "center" }}>左眼</th>
            <th style={{ ...thStyle, textAlign: "center" }}>右眼</th>
            <th style={{ ...thStyle, textAlign: "center" }}>均值</th>
            {type === "regular" && <th style={thStyle}>备注</th>}
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => {
            const avg = (record.left + record.right) / 2;
            return (
              <tr
                key={record.id}
                style={{
                  borderBottom:
                    index < records.length - 1 ? "1px solid #f1f5f9" : "none",
                  backgroundColor: index % 2 === 0 ? "white" : "#fafafa",
                }}
              >
                <td style={{ ...tdStyle, color: "#334155" }}>
                  {formatDateTime(record.date)}
                </td>
                <td
                  style={{
                    ...tdStyle,
                    textAlign: "center",
                    color: getValueColor(record.left),
                    fontWeight: record.left > 21 ? 700 : 400,
                  }}
                >
                  {record.left.toFixed(2)}
                </td>
                <td
                  style={{
                    ...tdStyle,
                    textAlign: "center",
                    color: getValueColor(record.right),
                    fontWeight: record.right > 21 ? 700 : 400,
                  }}
                >
                  {record.right.toFixed(2)}
                </td>
                <td
                  style={{
                    ...tdStyle,
                    textAlign: "center",
                    color: getValueColor(avg),
                    fontWeight: avg > 21 ? 700 : 400,
                  }}
                >
                  {avg.toFixed(2)}
                </td>
                {type === "regular" && (
                  <td style={{ ...tdStyle, color: "#64748b" }}>
                    {record.note || "-"}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
