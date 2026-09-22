import { Router } from "express";
import { importProducts } from "./imports.service.js";

export const importsRouter = Router();

importsRouter.post("/", (req, res) => {
  const csv = typeof req.body.csv === "string" ? req.body.csv : "";
  res.json({ data: importProducts(csv) });
});
