ALTER TABLE product_master ADD COLUMN product_type TEXT NOT NULL DEFAULT 'physical' CHECK (product_type IN ('physical', 'digital', 'service'));
