# E-Commerce Analytics — Client

React + Vite + Tailwind frontend for the dashboard. Part 4 built layout,
routing, filters, stat cards (with real trend %), tables, and loading/error/
empty states. Part 5 replaced the chart placeholders with real Recharts
visualizations wired to the Part 3 analytics endpoints. Part 6 added
Orders/Products pages (search, pagination, filters), Top Products
sorting/limit, CSV export, Reset Filters, and URL-persisted filter state.

## Setup

```bash
cd client
cp .env.example .env   # point VITE_API_URL at your running backend
npm install
npm run dev
```

Requires the Part 2/3 backend (`../server`) running and seeded — see the
server's own README/instructions for `npm run seed` and `npm start`.

## Structure

```
src/
├── api/          axios instance + one module per resource (analytics, orders, products, customers)
├── components/
│   ├── layout/   Sidebar, Header, ThemeToggle
│   ├── dashboard/
│   │   ├── RevenueChart / OrdersChart / CategoryChart / OrderStatusChart  (Recharts)
│   │   ├── ChartCard          shared loading/error/empty wrapper for all 4 charts
│   │   ├── DonutLegendList    shared legend for the two donut charts
│   │   ├── StatCard(s), FilterBar (+ Reset Filters, range label), ExportButton
│   │   ├── TopProductsTable   sortable columns + Top 5/10/20 limit selector
│   │   ├── RecentOrdersTable, status badge
│   ├── common/   ErrorState, EmptyState, SectionErrorBoundary, Pagination, SearchInput
│   └── ui/       Card + loading skeletons
├── context/      ThemeContext, DashboardFilterContext (single source of truth for filters,
│                 persisted to the URL as ?range=&category=&start=&end=)
├── hooks/        useApiData (generic) + thin wrappers per endpoint (incl. per-chart,
│                 useOrdersList, useProductsList, useDebouncedValue)
├── layouts/      AppLayout (sidebar + header shell)
├── pages/        Dashboard, OrdersPage, ProductsPage, Placeholder (Customers/Analytics/Settings)
├── utils/
│   ├── chartTheme.js   axis/grid colors (light+dark), brand + category + status color tokens
│   ├── chartTicks.js   X-axis tick-thinning for long date ranges
│   ├── dateRanges.js   preset ranges, previous-period calc, URL range codes, range label
│   ├── formatters.js   currency, compact currency, number, date, short chart-date
│   ├── csv.js          CSV building (with proper escaping) + browser download trigger
│   └── trend.js
└── App.jsx / main.jsx
```

## Notes

- Every number on the dashboard — stat cards, all 4 charts, top products,
  recent orders, orders/products tables — comes from the backend. No
  hardcoded chart data, percentages, or category lists anywhere in the
  frontend; categories always come from `GET /api/categories`.
- `DashboardFilterProvider` is mounted once at the top of `App.jsx` (above
  the routes), so the Dashboard, Orders, and Products pages all read and
  write the exact same date-range/category filter state, and that state is
  mirrored into the URL (`?range=30d&category=Electronics`) so a reload or
  shared link restores the same view.
- Orders/Products search is debounced (400ms) and paginated server-side —
  no attempt to load the full collection into the browser.
- CSV export re-fetches fresh data at click time using whatever filters are
  currently active, so it never exports stale or mismatched data.
- Charts read axis/grid colors from `useChartAxisColors()` since SVG fill
  values can't respond to Tailwind's `dark:` classes the way HTML can;
  tooltips and legends are plain HTML and use `dark:` classes as usual.
- `/customers`, `/analytics`, `/settings` still render a placeholder —
  intentionally out of scope so far.

## Testing

Testing stack: **Vitest** + **React Testing Library** + **@testing-library/user-event**
for unit/component tests, **Playwright** for one end-to-end flow.

```bash
npm test              # watch mode
npm run test:run      # run once
npm run test:coverage # run once with a coverage report
npm run test:e2e      # Playwright E2E (see below — needs a running app)
```

```
src/tests/
├── setup.js                jest-dom matchers, ResizeObserver + matchMedia
│                           polyfills (jsdom doesn't implement either,
│                           and Recharts' ResponsiveContainer needs both)
├── formatters.test.js, dateRanges.test.js, trendAndCsv.test.js
│                           pure utils — currency/date formatting, trend %
│                           calculation, CSV building/escaping
├── api.test.js             API service layer — correct endpoint + params,
│                           category="All" omitted, error propagation
├── StatCard.test.jsx        rendering, every metric, positive/negative/
│                           null/zero trend
├── StatCardsGrid.test.jsx   current+previous period fetch wiring, real
│                           computed trend %, loading/error states
├── FilterBar.test.jsx       real user interaction: category select, date
│                           preset click, Reset Filters, via the actual
│                           DashboardFilterContext (not mocked)
├── DateRangeValidation.test.jsx  the custom date-range picker's start/
│                                end constraints — the closest real
│                                analog to "form validation" this app has
│                                (no data-entry forms exist to validate)
├── Charts.test.jsx          all 4 charts — loading/error/empty/real-data,
│                           mocking the data hooks (not Recharts' SVG
│                           internals, per the "no fragile tests" rule)
├── TopProductsTable.test.jsx  sorting, Top 5/10/20 limit selector,
│                             empty/error states
├── RecentOrdersTable.test.jsx all 5 status badges, missing-customer
│                             fallback, empty/error states
├── Pagination.test.jsx      Prev/Next boundary behavior, page-number
│                           clicks, zero-results renders nothing
├── Search.test.jsx          debounce timing (fake timers), SearchInput
│                           accessibility
└── ExportButton.test.jsx    click → filtered API calls → success/error/
                            no-data feedback, jsdom download-API mocks
```

### Running the E2E test

```bash
# 1. Point the client at a running backend and build it:
cd client && echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run build

# 2. Serve the build and make sure the backend (seeded, from ../server) is running:
npm run preview   # serves on http://localhost:4173 by default

# 3. In another terminal:
npm run test:e2e
```

`e2e/dashboard.spec.js` covers the flow from the spec: load the dashboard,
wait for real analytics, change the category filter, change the date
range, and confirm every section (stat cards, all 4 charts, top products,
recent orders) is still present with no 5xx responses — plus a mobile-
viewport check for horizontal overflow. It hits whatever backend
`VITE_API_URL` pointed at when the app was built, so it's a genuine
integration check against your real (seeded) database, not a mock.

`@playwright/test` is pinned to `1.56.0` to match this environment's
pre-cached Chromium binary — if your machine doesn't have Playwright's
browsers installed yet, run `npx playwright install chromium` first.

