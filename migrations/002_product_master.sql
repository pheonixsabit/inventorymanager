CREATE TABLE IF NOT EXISTS product_master (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES product_master(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  variant_name TEXT NOT NULL DEFAULT 'Default',
  attributes_json TEXT NOT NULL DEFAULT '{}',
  barcode TEXT,
  unit TEXT NOT NULL DEFAULT 'piece',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS variant_cost_components (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  variant_id INTEGER NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  component_type TEXT NOT NULL,
  name TEXT NOT NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BDT',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS variant_inventory (
  variant_id INTEGER PRIMARY KEY REFERENCES product_variants(id) ON DELETE CASCADE,
  on_hand INTEGER NOT NULL DEFAULT 0,
  reserved INTEGER NOT NULL DEFAULT 0,
  reorder_point INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS variant_selling_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  variant_id INTEGER NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'default',
  price_cents INTEGER NOT NULL DEFAULT 0,
  compare_at_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'BDT',
  effective_from TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  active INTEGER NOT NULL DEFAULT 1,
  UNIQUE (variant_id, channel)
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variant_cost_components_variant_id ON variant_cost_components(variant_id);
CREATE INDEX IF NOT EXISTS idx_variant_selling_prices_variant_id ON variant_selling_prices(variant_id);

INSERT OR IGNORE INTO product_master (product_code, name, category, status)
SELECT 'LEGACY-' || sku, name, category, 'active' FROM products;

INSERT OR IGNORE INTO product_variants (product_id, sku, variant_name, unit)
SELECT pm.id, p.sku, 'Default', 'piece'
FROM products p
JOIN product_master pm ON pm.product_code = 'LEGACY-' || p.sku;

INSERT OR IGNORE INTO variant_cost_components (variant_id, component_type, name, amount_cents)
SELECT v.id, 'purchase', 'Base cost', p.cost_cents
FROM products p
JOIN product_variants v ON v.sku = p.sku;

INSERT OR IGNORE INTO variant_inventory (variant_id, on_hand, reorder_point)
SELECT v.id, p.stock_quantity, p.reorder_point
FROM products p
JOIN product_variants v ON v.sku = p.sku;

INSERT OR IGNORE INTO variant_selling_prices (variant_id, channel, price_cents, compare_at_cents)
SELECT v.id, 'default', p.price_cents, p.competitor_price_cents
FROM products p
JOIN product_variants v ON v.sku = p.sku;
