# Changelog

Project change history for the Inventory Manager application.

Date format: `YYYY-MM-DD`  
Prompt numbers follow the order of user prompts in this project conversation.

## 2026-10-01 — Prompt 1

### Created

- `index.html` — Initial inventory manager interface structure.
- `styles.css` — Initial application styling.
- `app.js` — Initial browser-side application behavior.

## 2026-10-01 — Prompt 2

### Created

- `package.json` — Node.js project metadata, scripts, and dependencies.
- `package-lock.json` — Locked npm dependency versions.
- `.gitignore` — Ignore rules for dependencies, environment files, logs, and SQLite runtime files.
- `.env.example` — Environment configuration template.
- `README.md` — Project setup, API, and structure documentation.
- `src/app.js` — Express application composition.
- `src/server.js` — HTTP server entry point.
- `src/config/env.js` — Environment configuration loading.
- `src/db/connection.js` — SQLite connection boundary.
- `src/db/migrations.js` — SQLite migration runner.
- `src/routes/api.js` — API route composition.
- `src/middleware/not-found.js` — Not-found middleware placeholder.
- `src/middleware/error-handler.js` — Error handling middleware placeholder.
- `src/utils/money.js` — Money utility module.
- `src/utils/csv.js` — CSV utility module.
- `migrations/001_initial_schema.sql` — Initial SQLite schema for products, pricing, stock, import, and export records.
- `seeds/sample-products.sql` — Sample product seed data.
- `scripts/migrate.js` — Database migration command.
- `scripts/seed.js` — Sample data seed command.
- `public/.gitkeep` — Placeholder for hostable frontend assets.
- `data/.gitkeep` — Placeholder for local SQLite data.
- Product module files under `src/modules/products/`.
- Pricing rule module files under `src/modules/pricing-rules/`.
- Dashboard module files under `src/modules/dashboard/`.
- Import module files under `src/modules/imports/`.
- Export module files under `src/modules/exports/`.

## 2026-10-01 — Prompt 3

### Created

- `src/modules/stock/stock.controller.js` — Stock movement handler placeholder.
- `src/modules/stock/stock.repository.js` — Stock movement database query placeholder.
- `src/modules/stock/stock.routes.js` — Stock movement route placeholder.
- `src/modules/stock/stock.service.js` — Stock movement business logic placeholder.
- `src/modules/stock/stock.schema.js` — Stock movement validation placeholder.
- `tests/.gitkeep` — Placeholder for automated tests.

### Modified

- `src/server.js` — Run SQLite migrations automatically before starting the HTTP server.
- `package.json` — Added the `npm test` script using Node's built-in test runner.

### Verification

- `npm run lint` passed.
- `npm run db:migrate` passed.
- `npm test` passed with no tests currently defined.
- `GET /api/health` returned `{ "ok": true }`.

## 2026-10-01 — Prompt 4

### Created

- `changelog.md` — This file, documenting project file creation and modification history.

## Changelog Maintenance

For every future user prompt that changes or verifies this project, append a new dated and prompt-numbered entry recording:

- Files created.
- Files modified or deleted.
- Relevant behavior or structural changes.
- Verification commands and results.

## 2026-10-01 — Prompt 5

### Modified

- `src/server.js` — Added a clear startup message when the configured port is already in use.

### Verification

- Confirmed that no process is currently listening on port `3000` after the reported failure.

## 2026-10-01 — Prompt 6

### Modified

- `src/config/env.js` — Changed the default application port from `3000` to `30000`.
- `.env.example` — Updated the example port to `30000`.
- `env.example` — Updated the example port to `30000`.
- `README.md` — Updated the documented local access URL to `http://localhost:30000`.

## 2026-10-01 — Prompt 7

### Modified

- `app.js` — Changed browser currency formatting from USD to Bangladeshi taka using the `en-BD` locale, `BDT` currency code, and taka narrow symbol.
- `index.html` — Updated the initial dashboard currency placeholders to taka.
- `README.md` — Documented that monetary values use Bangladeshi taka (BDT).

## 2026-10-01 — Prompt 8

### Created

- `migrations/002_product_master.sql` — Added separate SQLite tables for product masters, variants, cost components, inventory balances, and selling prices, with migration of existing products into the new model.
- `src/modules/product-master/product-master.schema.js` — Added validation for nested product master records.
- `src/modules/product-master/product-master.repository.js` — Added SQLite persistence and hydration for the product master model.
- `src/modules/product-master/product-master.service.js` — Added product master service boundary.
- `src/modules/product-master/product-master.routes.js` — Added product master API routes.

### Modified

- `src/routes/api.js` — Registered the `/api/product-master` API.
- `README.md` — Documented product master endpoints and module structure.

### Behavior

- A product is now a parent catalog record.
- A product variant owns the SKU, attributes, barcode, and unit.
- Cost components are stored independently per variant in BDT.
- Inventory is stored independently per variant with on-hand, reserved, and reorder values.
- Selling prices are stored independently per variant and sales channel.

### Verification

- `npm run db:migrate` passed.
- `npm run lint` passed.
- Live `POST /api/product-master` and `GET /api/product-master` round-trip passed on a temporary test port.

## 2026-10-01 — Prompt 9

### Created

- `migrations/003_product_type.sql` — Added `physical`, `digital`, and `service` product types.

### Modified

- `src/modules/product-master/product-master.schema.js` — Added product type validation with `physical` as the default.
- `src/modules/product-master/product-master.repository.js` — Persisted and returned product type values.
- `scripts/seed.js` — Added the iPhone Hard Shell Case example with four named variants, unique SKUs, stock quantities, costs, and default BDT prices.
- `README.md` — Documented the example seed data.

## 2026-10-01 — Prompt 10

### Modified

- `index.html` — Added a Product Master navigation view with parent-product fields, variant editor, and catalog table.
- `app.js` — Added Product Master loading, creation, editing, variant management, optional prices, stock totals, and API integration.
- `styles.css` — Added responsive styling for the Product Master form and variant rows.

### Behavior

- The browser now shows Product Master records at `http://localhost:30000/` under the Product Master navigation item.
- Each variant can be entered with its own name, SKU, stock, reorder point, cost, color attribute, and optional BDT price.
- Existing Product Master records can be searched and edited from the catalog table.

### Verification

- `npm run lint` passed.
- `node --check app.js` passed.
