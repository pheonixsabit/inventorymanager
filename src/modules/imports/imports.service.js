import { parseCsv } from "../../utils/csv.js";
import { upsertProduct } from "../products/products.service.js";

export function importProducts(csv) {
	const rows = parseCsv(csv);
	const products = rows.map((row) => ({
		sku: row.sku,
		name: row.name,
		category: row.category || "",
		cost: Number(row.cost) || 0,
		price: Number(row.price) || 0,
		competitor: Number(row.competitor) || 0,
		stock: Math.max(0, Math.round(Number(row.stock) || 0)),
		reorderPoint: Math.max(0, Math.round(Number(row.reorderPoint) || 0)),
		targetMargin: Number(row.targetMargin) || undefined
	})).filter((product) => product.sku && product.name);
	products.forEach(upsertProduct);
	return { imported: products.length };
}

