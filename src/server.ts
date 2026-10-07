import express from "express"

export const createServer = () => {
  const app = express();
  app.use(express.json())

  app.get("/health", (_req, res) => {
    res.status(200).json({
      message: "Server Running..."
    })
  })

  return app;
}
