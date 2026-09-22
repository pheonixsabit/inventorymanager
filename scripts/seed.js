import { runMigrations } from "../src/db/migrations.js";
import { upsertProduct } from "../src/modules/products/products.service.js";

runMigrations();

[
	{
		sku: "TEE-BLK-M",
		name: "Black Cotton T-Shirt",
		category: "Apparel",
		cost: 7.8,
		price: 18.99,
		competitor: 20.5,
		stock: 42,
		reorderPoint: 12,
		targetMargin: 38
	},
	{
		sku: "MUG-MATTE",
		name: "Matte Ceramic Mug",
		category: "Home",
		cost: 4.4,
		price: 12.99,
		competitor: 11.99,
		stock: 9,
		reorderPoint: 16,
		targetMargin: 34
	},
	{
		sku: "CAP-DENIM",
		name: "Denim Logo Cap",
		category: "Accessories",
		cost: 6.25,
		price: 17.95,
		competitor: 19.99,
		stock: 0,
		reorderPoint: 10,
		targetMargin: 40
	}
].forEach(upsertProduct);

console.log("Sample products seeded.");
