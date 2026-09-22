import { Router } from "express";
import { productSchema } from "./products.schema.js";
import { getProduct, listProducts, removeProduct, upsertProduct } from "./products.service.js";

export const productsRouter = Router();

productsRouter.get("/", (_req, res) => {
  res.json({ data: listProducts() });
});

productsRouter.get("/:sku", (req, res) => {
  const product = getProduct(req.params.sku);
  if (!product) return res.status(404).json({ error: { message: "Product not found" } });
  res.json({ data: product });
});

productsRouter.post("/", (req, res) => {
  const product = productSchema.parse(req.body);
  res.status(201).json({ data: upsertProduct(product) });
});

productsRouter.put("/:sku", (req, res) => {
  const product = productSchema.parse({ ...req.body, sku: req.params.sku });
  res.json({ data: upsertProduct(product) });
});

productsRouter.delete("/:sku", (req, res) => {
  if (!removeProduct(req.params.sku)) return res.status(404).json({ error: { message: "Product not found" } });
  res.status(204).end();
});
