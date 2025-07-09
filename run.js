import { createServer } from "vite";
import ngrokQrPlugin from "./dist/index.js";

const KEY = "2zaAU8UIui5ojQHjhzcSApAdz82_3vq9bZ9f2hHNaEC4v7pys";

const server = await createServer({
  plugins: [ngrokQrPlugin(KEY)],
});

// serve something on 5173

await server.listen();
