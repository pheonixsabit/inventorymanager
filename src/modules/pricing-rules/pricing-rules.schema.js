import { z } from "zod";

export const pricingRulesSchema = z.object({
	defaultMargin: z.coerce.number().min(1).max(95),
	marketplaceFee: z.coerce.number().min(0).max(80),
	shippingCost: z.coerce.number().min(0),
	minimumProfit: z.coerce.number().min(0),
	undercutPercent: z.coerce.number().min(0).max(50),
	priceEnding: z.enum([".99", ".95", ".00", "none"])
});

