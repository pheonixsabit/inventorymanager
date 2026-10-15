import { getDatabase } from "../../db/connection.js";
import { fromCents, toCents } from "../../utils/money.js";

function mapMaster(row, variants) {
  return {
    productCode: row.product_code,
    name: row.name,
    brand: row.brand || "",
    category: row.category || "",
    productType: row.product_type,
    description: row.description || "",
    status: row.status,
    variants
  };
}

function mapVariant(row, costs, inventory, prices) {
  return {
    sku: row.sku,
    variantName: row.variant_name,
    attributes: JSON.parse(row.attributes_json || "{}"),
    barcode: row.barcode || "",
    unit: row.unit,
    costs: costs.map((cost) => ({
      componentType: cost.component_type,
      name: cost.name,
      amount: fromCents(cost.amount_cents),
      currency: cost.currency
    })),
    inventory: {
      onHand: inventory?.on_hand || 0,
      reserved: inventory?.reserved || 0,
      reorderPoint: inventory?.reorder_point || 0
    },
    sellingPrices: prices.map((price) => ({
      channel: price.channel,
      price: fromCents(price.price_cents),
      compareAt: fromCents(price.compare_at_cents),
      currency: price.currency
    }))
  };
}

function hydrate(row) {
  const database = getDatabase();
  const variants = database.prepare("SELECT * FROM product_variants WHERE product_id = ? ORDER BY sku").all(row.id).map((variant) => mapVariant(
    variant,
    database.prepare("SELECT * FROM variant_cost_components WHERE variant_id = ? ORDER BY id").all(variant.id),
    database.prepare("SELECT * FROM variant_inventory WHERE variant_id = ?").get(variant.id),
    database.prepare("SELECT * FROM variant_selling_prices WHERE variant_id = ? ORDER BY channel").all(variant.id)
  ));
  return mapMaster(row, variants);
}

export function findAllProductMasters() {
  const rows = getDatabase().prepare("SELECT * FROM product_master ORDER BY name COLLATE NOCASE").all();
  return rows.map(hydrate);
}

export function findProductMaster(productCode) {
  const row = getDatabase().prepare("SELECT * FROM product_master WHERE product_code = ?").get(productCode);
  return row ? hydrate(row) : null;
}

export function saveProductMaster(product) {
  const database = getDatabase();
  database.exec("BEGIN");
  try {
    database.prepare(`
      INSERT INTO product_master (product_code, name, brand, category, product_type, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(product_code) DO UPDATE SET name = excluded.name, brand = excluded.brand,
        category = excluded.category, product_type = excluded.product_type,
        description = excluded.description, status = excluded.status,
        updated_at = CURRENT_TIMESTAMP
    `).run(product.productCode, product.name, product.brand, product.category, product.productType, product.description, product.status);

    const master = database.prepare("SELECT id FROM product_master WHERE product_code = ?").get(product.productCode);
    database.prepare("DELETE FROM product_variants WHERE product_id = ?").run(master.id);

    for (const variant of product.variants) {
      database.prepare(`
        INSERT INTO product_variants (product_id, sku, variant_name, attributes_json, barcode, unit)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(master.id, variant.sku, variant.variantName, JSON.stringify(variant.attributes), variant.barcode, variant.unit);
      const savedVariant = database.prepare("SELECT id FROM product_variants WHERE sku = ?").get(variant.sku);

      for (const cost of variant.costs) {
        database.prepare(`INSERT INTO variant_cost_components (variant_id, component_type, name, amount_cents, currency) VALUES (?, ?, ?, ?, ?)`)
          .run(savedVariant.id, cost.componentType, cost.name, toCents(cost.amount), cost.currency);
      }

      database.prepare(`INSERT INTO variant_inventory (variant_id, on_hand, reserved, reorder_point) VALUES (?, ?, ?, ?)`)
        .run(savedVariant.id, variant.inventory.onHand, variant.inventory.reserved, variant.inventory.reorderPoint);

      for (const price of variant.sellingPrices) {
        database.prepare(`INSERT INTO variant_selling_prices (variant_id, channel, price_cents, compare_at_cents, currency) VALUES (?, ?, ?, ?, ?)`)
          .run(savedVariant.id, price.channel, toCents(price.price), price.compareAt == null ? null : toCents(price.compareAt), price.currency);
      }
    }

    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
  return findProductMaster(product.productCode);
}
