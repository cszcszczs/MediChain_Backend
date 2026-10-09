import { scopePerRequest } from "awilix-express";
import express from "express"
import { container } from "./config/container.ts";
import v1Router from "./routes/v1/index.ts"

export const createServer = () => {
  const app = express();
  app.use(express.json())

  app.use(scopePerRequest(container));

  app.use("/v1", v1Router);
  
  app.get("/health", (_req, res) => {
    res.status(200).json({
      message: "Server Running..."
    })
  })

  return app;
}
