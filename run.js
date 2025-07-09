import { createServer } from "vite";
import ngrokQrPlugin from "./dist/index.js";

const KEY = "REDACTED";

const server = await createServer({
  plugins: [ngrokQrPlugin(KEY)],
});

// serve something on 5173

await server.listen();
