import { getPricingRules, savePricingRules } from "./pricing-rules.repository.js";
import { roundMoney } from "../../utils/money.js";

export { getPricingRules as getRules, savePricingRules as saveRules };

export function suggestPrice(product, rules = getPricingRules()) {
	const cost = Number(product.cost) || 0;
	const margin = Number(product.targetMargin) || rules.defaultMargin;
	const feeRate = rules.marketplaceFee / 100;
	const baseCost = cost + rules.shippingCost;
	const marginPrice = baseCost / Math.max(0.01, 1 - margin / 100 - feeRate);
	const profitPrice = (baseCost + rules.minimumProfit) / Math.max(0.01, 1 - feeRate);
	const competitor = Number(product.competitor) || 0;
	const competitorPrice = competitor > 0 ? competitor * (1 - rules.undercutPercent / 100) : 0;
	const target = competitorPrice > 0 ? Math.max(profitPrice, Math.min(marginPrice, competitorPrice)) : Math.max(marginPrice, profitPrice);

	if (rules.priceEnding === "none") return roundMoney(target);
	const ending = Number(rules.priceEnding);
	const rounded = Math.floor(target) + ending;
	return roundMoney(rounded < target ? rounded + 1 : rounded);
}

