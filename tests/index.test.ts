import { beforeEach, describe, expect, it, vi } from "vitest";

import ngrok from "@ngrok/ngrok";
import { ngrokQr } from "../src/index.js";
import qrcode from "qrcode";

// Mock ngrok before importing the plugin
vi.mock("@ngrok/ngrok", () => ({
  default: {
    forward: vi.fn(),
  },
}));

// Mock qrcode
vi.mock("qrcode", () => ({
  default: {
    toString: vi.fn(),
  },
}));

describe("ngrokQr", () => {
  const mockServer = {
    config: {
      logger: {
        info: vi.fn(),
        error: vi.fn(),
      },
      server: {
        allowedHosts: [],
      },
    },
    httpServer: {
      on: vi.fn(),
      address: vi.fn().mockReturnValue({ port: 3000 }),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create ngrok tunnel and display QR code successfully", async () => {
    const plugin = ngrokQr();

    const mockNgrokInstance = {
      url: vi.fn().mockReturnValue("https://abc123.ngrok.io"),
      close: vi.fn(),
    };

    vi.mocked(ngrok.forward).mockResolvedValue(mockNgrokInstance);
    vi.mocked(qrcode.toString).mockResolvedValue(
      "████████████████████████████████████████"
    );

    // Call configureServer to set up the plugin
    await plugin.configureServer(mockServer);

    // Simulate the server starting to listen
    const listeningCallback = vi
      .mocked(mockServer.httpServer.on)
      .mock.calls.find((call) => call[0] === "listening")?.[1];

    if (listeningCallback) {
      await listeningCallback();
    }

    expect(vi.mocked(ngrok.forward)).toHaveBeenCalledWith({
      authtoken_from_env: true,
      addr: 3000,
    });

    expect(mockServer.config.logger.info).toHaveBeenCalledWith(
      expect.stringContaining(
        "➜  Ngrok tunnel created: https://abc123.ngrok.io"
      )
    );

    expect(vi.mocked(qrcode.toString)).toHaveBeenCalledWith(
      "https://abc123.ngrok.io",
      {
        type: "terminal",
        small: true,
      }
    );

    expect(mockServer.config.logger.info).toHaveBeenCalledWith(
      expect.stringContaining("➜  QR Code:")
    );
  });

  it("should throw error when ngrok initialization fails", async () => {
    const plugin = ngrokQr();

    vi.mocked(ngrok.forward).mockRejectedValue(
      new Error("ngrok initialization failed")
    );

    await plugin.configureServer(mockServer);

    const listeningCallback = vi
      .mocked(mockServer.httpServer.on)
      .mock.calls.find((call) => call[0] === "listening")?.[1];

    if (listeningCallback) {
      await expect(listeningCallback()).rejects.toThrow(
        "ngrok initialization failed"
      );
    }
  });

  it("should log error message when ngrok fails", async () => {
    const plugin = ngrokQr();

    vi.mocked(ngrok.forward).mockRejectedValue(
      new Error("ngrok initialization failed")
    );

    await plugin.configureServer(mockServer);

    const listeningCallback = vi
      .mocked(mockServer.httpServer.on)
      .mock.calls.find((call) => call[0] === "listening")?.[1];

    if (listeningCallback) {
      try {
        await listeningCallback();
      } catch (error) {
        // Error should be thrown
      }
    }

    expect(mockServer.config.logger.error).toHaveBeenCalledWith(
      "Invalid initialisation of ngrok\n--------------------------------"
    );
  });

  it("should handle custom options correctly", async () => {
    const plugin = ngrokQr({
      port: 5173,
      host: "127.0.0.1",
      protocol: "http",
      authtoken: "test-token",
    });

    const mockNgrokInstance = {
      url: vi.fn().mockReturnValue("https://abc123.ngrok.io"),
      close: vi.fn(),
    };

    vi.mocked(ngrok.forward).mockResolvedValue(mockNgrokInstance);
    vi.mocked(qrcode.toString).mockResolvedValue(
      "████████████████████████████████████████"
    );

    await plugin.configureServer(mockServer);

    const listeningCallback = vi
      .mocked(mockServer.httpServer.on)
      .mock.calls.find((call) => call[0] === "listening")?.[1];

    if (listeningCallback) {
      await listeningCallback();
    }

    expect(vi.mocked(ngrok.forward)).toHaveBeenCalledWith({
      authtoken: "test-token",
      proto: "http",
      addr: "127.0.0.1:5173",
    });
  });
});
