import type { Plugin } from "vite";
import ngrok from "@ngrok/ngrok";
import qrcode from "qrcode";

export interface NgrokQrOptions {
  port?: number;
  host?: string;
  protocol?: "http" | "https";
  authtoken?: string;
}

const handleOptions = (options: NgrokQrOptions | string, server: any) => {
  const defaultPort = server.httpServer?.address()?.port || 8080;
  if (typeof options === "string") {
    return {
      authtoken: options,
      addr: defaultPort,
    };
  } else {
    if (!Object.keys(options).length) {
      return {
        authtoken_from_env: true,
        addr: defaultPort,
      };
    }
    const {
      host,
      port = defaultPort,
      protocol = "tcp",
      authtoken = process.env.NGROK_AUTH_TOKEN,
    } = options;
    return {
      authtoken,
      proto: protocol,
      addr: host ? `${host}:${port}` : port,
    };
  }
};

export default function ngrokQrPlugin(options: NgrokQrOptions = {}): Plugin {
  return {
    name: "ngrok-qr",
    async configureServer(server) {
      server.httpServer?.on("listening", async () => {
        // generate only after all the messages are loaded
        try {
          let optionObject = handleOptions(options, server);
          const ngrokInstance = await ngrok.forward(optionObject);
          const url = ngrokInstance.url();
          if (url) {
            // Allow the ngrok host in Vite's allowedHosts if possible
            const ngrokHost = new URL(url).hostname.split(":")[0];
            if (
              server.config.server &&
              Array.isArray(server.config.server.allowedHosts)
            ) {
              if (!server.config.server.allowedHosts.includes(ngrokHost)) {
                server.config.server.allowedHosts.push(ngrokHost);
              }
            }
            const funColor = "\x1b[38;2;0;139;139m"; // Darker Cyan
            server.config.logger.info(
              `${funColor}  \u279C  Ngrok tunnel created: ${url}\x1b[0m`
            );
            const qrCode = await qrcode.toString(url, {
              type: "terminal",
              small: true,
            });
            server.config.logger.info(
              `${funColor}  \u279C  QR Code: \n\n${qrCode}\x1b[0m`
            );
          }

          // close the ngrok tunnel when the server is stopped
          server.httpServer?.on("close", () => {
            ngrokInstance.close();
          });
        } catch (e: any) {
          server.config.logger.error(
            "Invalid initialisation of ngrok\n--------------------------------"
          );
          throw e;
        }
      });
    },
  };
}

export { ngrokQrPlugin as ngrokQr };
