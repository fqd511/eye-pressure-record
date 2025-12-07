/**
 * Notion API service for fetching eye pressure records
 * Handles connection and data transformation from Notion database
 */

import { Client } from "@notionhq/client";
import { EyePressureRecord } from "@/types";

// Fetch all records from Notion database
export async function fetchAllRecords(): Promise<EyePressureRecord[]> {
  // Initialize Notion client
  const notion = new Client({
    auth: process.env.NOTION_AUTH_TOKEN,
  });

  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!databaseId) {
    throw new Error("NOTION_DATABASE_ID is not set");
  }

  const records: EyePressureRecord[] = [];
  let cursor: string | undefined = undefined;

  // Paginate through all results
  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      sorts: [{ property: "Date", direction: "ascending" }],
    });

    // Transform Notion pages to our record format
    for (const page of response.results) {
      if ("properties" in page) {
        const record = transformNotionPage(page);
        if (record) {
          records.push(record);
        }
      }
    }

    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return records;
}

// Transform a Notion page to EyePressureRecord
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformNotionPage(page: any): EyePressureRecord | null {
  try {
    const props = page.properties;

    // Extract date from Date property
    const dateValue = props.Date?.date?.start;
    if (!dateValue) return null;

    // Extract title from Name property
    const name = props.Name?.title?.[0]?.plain_text || "";

    // Extract number values
    const left = props.Left?.number ?? 0;
    const right = props.Right?.number ?? 0;

    // Extract checkbox value
    const is24h = props.is24h?.checkbox ?? false;

    // Extract note text
    const note = props.Note?.rich_text?.[0]?.plain_text || "";

    return {
      id: page.id,
      name,
      date: new Date(dateValue).toISOString(), // Store as ISO string
      left,
      right,
      is24h,
      note,
    };
  } catch (error) {
    console.error("Error transforming page:", error);
    return null;
  }
}
