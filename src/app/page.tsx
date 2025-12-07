/**
 * Main page for eye pressure record application
 * Server component - fetches data from Notion and renders client components
 */

import { fetchAllRecords } from "@/lib/notion";
import { groupRecords } from "@/lib/grouping";
import MainContent from "@/components/MainContent";
import { RecordGroup } from "@/types";

export default async function Home() {
  let groups: RecordGroup[] = [];
  let error: string | null = null;

  try {
    // Check for required environment variables
    if (!process.env.NOTION_DATABASE_ID || !process.env.NOTION_AUTH_TOKEN) {
      throw new Error("Missing Notion configuration in environment variables");
    }

    // Fetch all records from Notion
    const records = await fetchAllRecords();

    // Group records by is24h and time proximity
    groups = groupRecords(records);
  } catch (err) {
    console.error("Error fetching records:", err);
    error = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #f8fafc, #eff6ff, #f1f5f9)",
      }}
    >
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(255,255,255,0.8)",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Eye icon */}
            <div
              style={{
                padding: "8px",
                background: "linear-gradient(to bottom right, #3b82f6, #8b5cf6)",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.2)",
              }}
            >
              <svg
                style={{ width: "24px", height: "24px", color: "white" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
                眼压记录
              </h1>
              <p style={{ fontSize: "14px", color: "#64748b" }}>
                Eye Pressure Records
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "32px 16px",
        }}
      >
        <MainContent groups={groups} error={error} />
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #e2e8f0", marginTop: "48px" }}>
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "24px 16px",
          }}
        >
          <p style={{ textAlign: "center", fontSize: "14px", color: "#64748b" }}>
            All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
