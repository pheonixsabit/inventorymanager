import { Router } from "express";
import { exportProducts } from "./exports.service.js";

export const exportsRouter = Router();

exportsRouter.get("/", (_req, res) => {
  res.type("text/csv").attachment("inventory.csv").send(exportProducts());
});
