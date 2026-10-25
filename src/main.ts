import { createServer } from "./server.ts";
import { env } from "./config/env.ts";
import { debug } from "node:console";

const app = createServer();

const PORT = env.port;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

process.on("SIGINT", () => {
  debug('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    debug("Server closed")
  })
})