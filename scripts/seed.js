import { runMigrations } from "../src/db/migrations.js";
import { upsertProduct } from "../src/modules/products/products.service.js";
import { upsertProductMaster } from "../src/modules/product-master/product-master.service.js";

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

upsertProductMaster({
	productCode: "IPHONE-HARD-SHELL",
	name: "iPhone Hard Shell Case",
	category: "Phone Accessories",
	brand: "Jin yiheng",
	productType: "physical",
	description: "Hard shell phone case with lens film, anti-fingerprint, anti-fall and heat dissipation features.",
	status: "active",
	variants: [
		["Cherry Red", "IPHONE-HARD-RED", 18],
		["Sky Blue", "IPHONE-HARD-BLUE", 22],
		["Xingyu Orange", "IPHONE-HARD-ORANGE", 15],
		["Elegant Silver", "IPHONE-HARD-SILVER", 12]
	].map(([variantName, sku, onHand]) => ({
		sku,
		variantName: `${variantName} with Lens Film`,
		attributes: { color: variantName, feature: "Lens Film" },
		barcode: "",
		unit: "piece",
		costs: [{ componentType: "purchase", name: "Supplier cost", amount: 180, currency: "BDT" }],
		inventory: { onHand, reserved: 0, reorderPoint: 5 },
		sellingPrices: [{ channel: "default", price: 399, compareAt: 449, currency: "BDT" }]
	}))
});

console.log("Sample products seeded.");
