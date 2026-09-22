import { Router } from "express";
import { dashboardRouter } from "../modules/dashboard/dashboard.routes.js";
import { exportsRouter } from "../modules/exports/exports.routes.js";
import { importsRouter } from "../modules/imports/imports.routes.js";
import { pricingRulesRouter } from "../modules/pricing-rules/pricing-rules.routes.js";
import { productsRouter } from "../modules/products/products.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ ok: true });
});

apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/exports", exportsRouter);
apiRouter.use("/imports", importsRouter);
apiRouter.use("/pricing-rules", pricingRulesRouter);
apiRouter.use("/products", productsRouter);
