/**
 * Main content component for displaying eye pressure data
 * Client component - handles interactive display of grouped records
 */

"use client";

import { RecordGroup as RecordGroupType } from "@/types";
import RecordGroup from "./RecordGroup";

interface MainContentProps {
  groups: RecordGroupType[];
  error: string | null;
}

export default function MainContent({ groups, error }: MainContentProps) {
  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "#fee2e2",
            marginBottom: "16px",
          }}
        >
          <svg
            style={{ width: "32px", height: "32px", color: "#ef4444" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "#0f172a",
            marginBottom: "8px",
          }}
        >
          Load failed
        </h2>
        <p style={{ color: "#64748b" }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "16px",
            padding: "8px 16px",
            backgroundColor: "#3b82f6",
            color: "white",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "#f1f5f9",
            marginBottom: "16px",
          }}
        >
          <svg
            style={{ width: "32px", height: "32px", color: "#94a3b8" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "#0f172a",
            marginBottom: "8px",
          }}
        >
          No data
        </h2>
        <p style={{ color: "#64748b" }}>Please add eye pressure records in Notion database first</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {groups.map((group) => (
        <RecordGroup key={group.id} group={group} />
      ))}
    </div>
  );
}
