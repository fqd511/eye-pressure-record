# Eye Pressure Record

A single-page application for visualizing eye pressure measurement data from Notion database.

## Features

- **Data Source**: Fetches records from Notion database via official SDK
- **Data Grouping**: 
  - Regular measurements displayed as one group
  - 24-hour continuous measurements grouped by 30h time window
- **Interactive Charts**:
  - Left/right eye pressure lines with average line (toggleable)
  - Normal range (10-21) highlighted with green background
  - Reference lines for upper/lower limits
  - Time-proportional or uniform X-axis (switchable)
  - Fullscreen mode with mobile landscape support
- **Data Table**: Shows all fields with abnormal value highlighting

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Recharts (charts)
- @notionhq/client v2 (Notion API)

## Configuration

Create `.env.local` file in project root:

```env
NOTION_DATABASE_ID=your_database_id
NOTION_AUTH_TOKEN=your_notion_integration_token
```

### Notion Database Schema

| Field | Type | Description |
|-------|------|-------------|
| Name | Title | Record name |
| Date | Date | Measurement date/time |
| Left | Number | Left eye pressure |
| Right | Number | Right eye pressure |
| is24h | Checkbox | Is 24-hour continuous measurement |
| Note | Text | Notes |

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main page (server component)
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── MainContent.tsx   # Main content wrapper
│   ├── RecordGroup.tsx   # Group display (table + chart)
│   ├── DataTable.tsx     # Data table
│   └── PressureChart.tsx # Interactive line chart
├── lib/
│   ├── notion.ts         # Notion API service
│   └── grouping.ts       # Data grouping logic
└── types/
    └── index.ts          # TypeScript definitions
```

## License

MIT
