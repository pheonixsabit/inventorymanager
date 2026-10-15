# Inventory Manager

Modern Node.js inventory management app scaffold with SQLite persistence. Monetary values are displayed and stored as Bangladeshi taka (BDT).

## Quick Start

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

The server entry point is `src/server.js`. SQLite files are intended to live in `data/`.

The app is available at `http://localhost:30000` and stores products, pricing rules, stock movements, and import/export job records in SQLite. The browser UI uses the API rather than browser-local storage.

## API

- `GET /api/health` - health check
- `GET|POST /api/products` - list or create products
- `GET|PUT|DELETE /api/products/:sku` - read, update, or remove a product
- `GET|POST /api/product-master` - list or create parent products with variants, costs, inventory, and selling prices
- `GET|PUT /api/product-master/:productCode` - read or replace a product master record
- `GET|PUT /api/pricing-rules` - read or update automatic pricing rules
- `GET /api/dashboard` - inventory metrics, pricing queue, and reorder alerts
- `POST /api/imports` - import products from a CSV string in `{ "csv": "..." }`
- `GET /api/exports` - download the product catalog as CSV

Node.js 22.5 or newer is required because the app uses the built-in `node:sqlite` driver.

## Structure

- `src/app.js` - Express app composition
- `src/server.js` - HTTP server bootstrap
- `src/config/` - environment and app configuration
- `src/db/` - SQLite connection and schema helpers
- `src/modules/` - feature modules for products, pricing rules, dashboard, imports, and exports
- `src/modules/product-master/` - parent products, variants, cost components, inventory, and selling-price records
- `npm run db:seed` - includes the iPhone Hard Shell Case example with four color variants
- `src/middleware/` - shared middleware
- `src/utils/` - reusable utilities
- `migrations/` - SQL migrations
- `seeds/` - seed data
- `scripts/` - operational scripts
- `public/` - hostable frontend assets
