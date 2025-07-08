import type { Plugin } from "vite";
import ngrok from "@ngrok/ngrok";
import qrcode from "qrcode";

export interface NgrokQrOptions {
  port?: number;
  host?: string;
  protocol?: "http" | "https";
  authtoken?: string;
}

const handleOptions = (options: NgrokQrOptions | string) => {
  if (typeof options === "string") {
    return {
      authtoken: options,
    };
  } else {
    const {
      port = 3000,
      host = "localhost",
      protocol = "tcp",
      authtoken = process.env.NGROK_AUTH_TOKEN,
    } = options;
    return {
      authtoken,
      proto: protocol,
      addr: `${host}:${port}`,
    };
  }
};

export default function ngrokQrPlugin(options: NgrokQrOptions = {}): Plugin {
  return {
    name: "ngrok-qr",
    async configureServer(server) {
      const optionObject = handleOptions(options);
      try {
        const ngrokInstance = await ngrok.forward(optionObject);
        const url = ngrokInstance.url();
        if (url) {
          server.config.logger.info(`\u279C Ngrok tunnel created: ${url}`);
          const qrCode = await qrcode.toString(url, {
            type: "terminal",
            small: true,
          });
          server.config.logger.info(`\u279C QR Code: \n\n${qrCode}`);
        }
      } catch (e: any) {
        server.config.logger.error(
          "Invalid initialisation of ngrok\n--------------------------------"
        );
        throw e;
      }
    },
  };
}

export { ngrokQrPlugin as "ngrok-qr" };
