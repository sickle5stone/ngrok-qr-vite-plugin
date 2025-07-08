# ngrok-qr-vite-plugin

A Vite plugin that automatically creates an ngrok tunnel and displays a QR code in the terminal for easy mobile testing.

## Features

- 🔗 Automatically creates ngrok tunnels when Vite dev server starts
- 📱 Generates QR codes in the terminal for easy mobile access
- ⚙️ Configurable port, host, and protocol settings
- 🔐 Supports ngrok authentication via token or environment variable

## Installation

```bash
npm install ngrok-qr-vite-plugin
```

## Setup

### 1. Get an ngrok auth token

Sign up at [ngrok.com](https://ngrok.com) and get your auth token from the dashboard.

### 2. Set your auth token

Either set it as an environment variable:
```bash
export NGROK_AUTH_TOKEN="your_ngrok_auth_token_here"
```

Or provide it directly in the plugin options.

## Usage

### Basic Usage

```typescript
import { defineConfig } from 'vite'
import ngrokQrPlugin from 'ngrok-qr-vite-plugin'

export default defineConfig({
  plugins: [
    ngrokQrPlugin()
  ]
})
```

### With Custom Configuration

```typescript
import { defineConfig } from 'vite'
import ngrokQrPlugin from 'ngrok-qr-vite-plugin'

export default defineConfig({
  plugins: [
    ngrokQrPlugin({
      port: 5173,        // Default: 3000
      host: 'localhost', // Default: 'localhost'
      protocol: 'http',  // Default: 'tcp'
      authtoken: 'your_ngrok_auth_token_here' // Optional: can use NGROK_AUTH_TOKEN env var
    })
  ]
})
```

### Using Auth Token as String

```typescript
import { defineConfig } from 'vite'
import ngrokQrPlugin from 'ngrok-qr-vite-plugin'

export default defineConfig({
  plugins: [
    ngrokQrPlugin('your_ngrok_auth_token_here')
  ]
})
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | `number` | `3000` | The port to tunnel |
| `host` | `string` | `'localhost'` | The host to tunnel |
| `protocol` | `'http' \| 'https'` | `'tcp'` | The protocol to use |
| `authtoken` | `string` | `process.env.NGROK_AUTH_TOKEN` | Your ngrok auth token |

## What Happens

When you start your Vite dev server:

1. The plugin automatically creates an ngrok tunnel to your local server
2. The ngrok URL is displayed in the terminal
3. A QR code is generated and displayed in the terminal
4. You can scan the QR code with your mobile device to access your app

## Development

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Development mode
npm run dev
```

## License

MIT 
