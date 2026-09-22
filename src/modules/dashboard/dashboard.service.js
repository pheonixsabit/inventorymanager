import { listProducts } from "../products/products.service.js";
import { getRules, suggestPrice } from "../pricing-rules/pricing-rules.service.js";
import { roundMoney } from "../../utils/money.js";

export function getDashboard() {
	const products = listProducts();
	const rules = getRules();
	const profitFor = (product) => roundMoney(product.price - product.cost - rules.shippingCost - product.price * rules.marketplaceFee / 100);
	const lowStock = products.filter((product) => product.stock <= product.reorderPoint);

	return {
		metrics: {
			totalSkus: products.length,
			inventoryValue: roundMoney(products.reduce((sum, product) => sum + product.cost * product.stock, 0)),
			lowStockCount: lowStock.length,
			expectedProfit: roundMoney(products.reduce((sum, product) => sum + profitFor(product) * product.stock, 0))
		},
		pricingQueue: products
			.map((product) => ({ product, suggested: suggestPrice(product, rules) }))
			.filter(({ product, suggested }) => Math.abs(suggested - product.price) >= 0.01),
		reorderAlerts: lowStock
	};
}

