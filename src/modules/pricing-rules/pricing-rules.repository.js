import { getDatabase } from "../../db/connection.js";
import { fromCents, toCents } from "../../utils/money.js";

function mapRules(row) {
	return {
		defaultMargin: row.default_margin_percent,
		marketplaceFee: row.marketplace_fee_percent,
		shippingCost: fromCents(row.shipping_cents),
		minimumProfit: fromCents(row.minimum_profit_cents),
		undercutPercent: row.undercut_percent,
		priceEnding: row.price_ending
	};
}

export function getPricingRules() {
	return mapRules(getDatabase().prepare("SELECT * FROM pricing_rules WHERE id = 1").get());
}

export function savePricingRules(rules) {
	getDatabase().prepare(`
		UPDATE pricing_rules SET default_margin_percent = ?, marketplace_fee_percent = ?,
			shipping_cents = ?, minimum_profit_cents = ?, undercut_percent = ?,
			price_ending = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1
	`).run(
		rules.defaultMargin,
		rules.marketplaceFee,
		toCents(rules.shippingCost),
		toCents(rules.minimumProfit),
		rules.undercutPercent,
		rules.priceEnding
	);
	return getPricingRules();
}

