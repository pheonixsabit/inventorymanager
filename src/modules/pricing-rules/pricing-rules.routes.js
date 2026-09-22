import { Router } from "express";
import { pricingRulesSchema } from "./pricing-rules.schema.js";
import { getRules, saveRules, suggestPrice } from "./pricing-rules.service.js";

export const pricingRulesRouter = Router();

pricingRulesRouter.get("/", (_req, res) => {
  res.json({ data: getRules() });
});

pricingRulesRouter.put("/", (req, res) => {
  res.json({ data: saveRules(pricingRulesSchema.parse(req.body)) });
});

pricingRulesRouter.post("/preview", (req, res) => {
  res.json({ data: { price: suggestPrice(req.body.product, req.body.rules) } });
});
