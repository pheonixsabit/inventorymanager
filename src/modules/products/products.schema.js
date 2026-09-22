import { z } from "zod";

export const productSchema = z.object({
	sku: z.string().trim().min(1).max(80),
	name: z.string().trim().min(1).max(200),
	category: z.string().trim().max(100).default(""),
	cost: z.coerce.number().min(0),
	price: z.coerce.number().min(0),
	competitor: z.coerce.number().min(0).default(0),
	stock: z.coerce.number().int().min(0),
	reorderPoint: z.coerce.number().int().min(0),
	targetMargin: z.coerce.number().min(1).max(95).optional()
});

