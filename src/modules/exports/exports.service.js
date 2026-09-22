import { listProducts } from "../products/products.service.js";
import { toCsv } from "../../utils/csv.js";

export function exportProducts() {
	return toCsv(listProducts(), ["sku", "name", "category", "cost", "price", "competitor", "stock", "reorderPoint", "targetMargin"]);
}

