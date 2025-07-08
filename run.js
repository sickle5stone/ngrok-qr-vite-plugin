import { createServer } from "vite";
import ngrokQrPlugin from "./dist/index.js";

const KEY = "<YOUR_NGROK_AUTH_TOKEN>";

const server = await createServer({
  plugins: [ngrokQrPlugin()],
});

await server.listen();
