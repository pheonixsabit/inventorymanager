import { getDatabase } from "../../db/connection.js";
import { fromCents, toCents } from "../../utils/money.js";

function mapProduct(row) {
	if (!row) return null;
	return {
		sku: row.sku,
		name: row.name,
		category: row.category || "",
		cost: fromCents(row.cost_cents),
		price: fromCents(row.price_cents),
		competitor: fromCents(row.competitor_price_cents),
		stock: row.stock_quantity,
		reorderPoint: row.reorder_point,
		targetMargin: row.target_margin_percent
	};
}

export function findAllProducts() {
	return getDatabase().prepare("SELECT * FROM products ORDER BY name COLLATE NOCASE").all().map(mapProduct);
}

export function findProductBySku(sku) {
	return mapProduct(getDatabase().prepare("SELECT * FROM products WHERE sku = ?").get(sku));
}

export function saveProduct(product) {
	const database = getDatabase();
	database.prepare(`
		INSERT INTO products (
			sku, name, category, cost_cents, price_cents, competitor_price_cents,
			stock_quantity, reorder_point, target_margin_percent
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(sku) DO UPDATE SET
			name = excluded.name,
			category = excluded.category,
			cost_cents = excluded.cost_cents,
			price_cents = excluded.price_cents,
			competitor_price_cents = excluded.competitor_price_cents,
			stock_quantity = excluded.stock_quantity,
			reorder_point = excluded.reorder_point,
			target_margin_percent = excluded.target_margin_percent,
			updated_at = CURRENT_TIMESTAMP
	`).run(
		product.sku,
		product.name,
		product.category,
		toCents(product.cost),
		toCents(product.price),
		product.competitor > 0 ? toCents(product.competitor) : null,
		product.stock,
		product.reorderPoint,
		product.targetMargin ?? null
	);
	return findProductBySku(product.sku);
}

export function deleteProduct(sku) {
	return getDatabase().prepare("DELETE FROM products WHERE sku = ?").run(sku).changes > 0;
}

