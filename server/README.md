# E-Commerce Analytics — Server

Express + Mongoose backend for the dashboard: MongoDB models and seed data
(Part 2), analytics/orders/products/customers APIs (Part 3), and an
automated test suite (Part 7).

## Setup

```bash
cd server
cp .env.example .env   # set a real MONGO_URI
npm install
npm run seed            # populate MongoDB with realistic sample data
npm start                # or `npm run dev` for nodemon
```

`server.js` is just the entry point — it wires a real MongoDB connection to
the Express app and starts listening. The app itself (routes, middleware,
no DB connection) lives in `app.js`, which is what the test suite imports
directly so tests never touch a real database or open a port.

## Testing

Testing stack: **Vitest** + **Supertest**.

```bash
npm test              # watch mode
npm run test:run      # run once
npm run test:coverage # run once with a coverage report
```

```
tests/
├── unit/
│   ├── queryHelpers.test.js      pure validation logic: dates, category,
│   │                             status, pagination, limit bounds
│   └── analyticsService.test.js  real calculation correctness — revenue,
│                                 average order value, rounding, zero-
│                                 division safety, order-status zero-fill
└── integration/
    ├── analyticsRoutes.test.js   Supertest against the real Express app:
    │                             happy-path shapes, validation 400s, 404s
    └── resources.test.js         orders/products/customers/recent-orders:
                                  pagination, search, status filtering
```

### Database isolation

No live or in-memory MongoDB is used in these tests (this sandbox's network
policy blocks `mongodb-memory-server`'s binary download — `fastdl.mongodb.org`
returned a 403 when tried). Instead, tests `require()` the real Mongoose
model files (safe — Mongoose doesn't connect to anything just by being
required) and use `vi.spyOn()` to replace only the specific method under
test (`Order.aggregate`, `Product.find`, etc.) with controlled fixture data.
Node's module cache guarantees the service/controller code under test sees
the exact same object being spied on.

**Known limitation:** this verifies pipeline *construction* (the `$match`/
`$group`/`$limit` stages sent to MongoDB) and all real JS-side math (AOV
division, rounding, zero-status-filling) — but never exercises MongoDB's
own aggregation engine executing those pipelines. If you have a real
MongoDB available, the most valuable additional check is running
`npm run seed` then manually hitting a few endpoints to confirm the
pipelines return what's expected against real data.

## Linting

No linter is configured for this project.
