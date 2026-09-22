import { Router } from "express";
import { getDashboard } from "./dashboard.service.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", (_req, res) => {
  res.json({ data: getDashboard() });
});
