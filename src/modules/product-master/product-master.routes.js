import { Router } from "express";
import { productMasterSchema } from "./product-master.schema.js";
import { getProductMaster, listProductMasters, upsertProductMaster } from "./product-master.service.js";

export const productMasterRouter = Router();

productMasterRouter.get("/", (_req, res) => {
  res.json({ data: listProductMasters() });
});

productMasterRouter.get("/:productCode", (req, res) => {
  const product = getProductMaster(req.params.productCode);
  if (!product) return res.status(404).json({ error: { message: "Product master record not found" } });
  res.json({ data: product });
});

productMasterRouter.post("/", (req, res) => {
  const product = productMasterSchema.parse(req.body);
  res.status(201).json({ data: upsertProductMaster(product) });
});

productMasterRouter.put("/:productCode", (req, res) => {
  const product = productMasterSchema.parse({ ...req.body, productCode: req.params.productCode });
  res.json({ data: upsertProductMaster(product) });
});
