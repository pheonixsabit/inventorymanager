import { z } from "zod";

const costComponentSchema = z.object({
  componentType: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(100),
  amount: z.coerce.number().min(0),
  currency: z.string().trim().length(3).default("BDT")
});

const inventorySchema = z.object({
  onHand: z.coerce.number().int().min(0).default(0),
  reserved: z.coerce.number().int().min(0).default(0),
  reorderPoint: z.coerce.number().int().min(0).default(0)
});

const sellingPriceSchema = z.object({
  channel: z.string().trim().min(1).max(50).default("default"),
  price: z.coerce.number().min(0),
  compareAt: z.coerce.number().min(0).nullable().optional(),
  currency: z.string().trim().length(3).default("BDT")
});

export const productMasterSchema = z.object({
  productCode: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(200),
  brand: z.string().trim().max(100).default(""),
  category: z.string().trim().max(100).default(""),
  productType: z.enum(["physical", "digital", "service"]).default("physical"),
  description: z.string().trim().max(2000).default(""),
  status: z.enum(["active", "draft", "archived"]).default("active"),
  variants: z.array(z.object({
    sku: z.string().trim().min(1).max(80),
    variantName: z.string().trim().min(1).max(100).default("Default"),
    attributes: z.record(z.string()).default({}),
    barcode: z.string().trim().max(100).default(""),
    unit: z.string().trim().min(1).max(30).default("piece"),
    costs: z.array(costComponentSchema).default([]),
    inventory: inventorySchema.default({}),
    sellingPrices: z.array(sellingPriceSchema).default([])
  })).min(1)
});
