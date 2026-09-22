import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { apiRouter } from "./routes/api.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicPath = path.resolve(__dirname, "../public");
const projectRoot = path.resolve(__dirname, "..");

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(express.static(publicPath));
  app.get("/", (_req, res) => res.sendFile(path.join(projectRoot, "index.html")));
  app.get("/app.js", (_req, res) => res.sendFile(path.join(projectRoot, "app.js")));
  app.get("/styles.css", (_req, res) => res.sendFile(path.join(projectRoot, "styles.css")));
  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
