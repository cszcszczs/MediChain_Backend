import { createServer } from "./server.ts";
import { env } from "./config/env.ts";

const app = createServer();

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
