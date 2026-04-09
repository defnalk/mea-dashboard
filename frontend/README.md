# Frontend — MEA Dashboard

React + Vite SPA for the MEA pilot plant dashboard.

## Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173.

## Scripts

| Command            | Description                    |
|--------------------|--------------------------------|
| `npm run dev`      | Start Vite dev server          |
| `npm run build`    | Type-check and build for prod  |
| `npm run typecheck`| `tsc --noEmit`                 |
| `npm run lint`     | ESLint                         |
| `npm test`         | Vitest (jsdom)                 |

## Architecture

- **TanStack Query** owns all data fetching (`src/api/`).
- **Zustand** holds cross-page UI state (`src/stores/dashboardStore.ts`).
- **Recharts** powers all charts; every chart is wrapped in `ResponsiveContainer`.
- Pages live in `src/pages/`, reusable building blocks in `src/components/`.
