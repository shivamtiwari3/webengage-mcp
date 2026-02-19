<p align="center">
  <img src="https://img.shields.io/badge/MCP-Server-blueviolet?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6Ii8+PHBhdGggZD0iTTIgMTdsMTAgNSAxMC01Ii8+PHBhdGggZD0iTTIgMTJsMTAgNSAxMC01Ii8+PC9zdmc+" alt="MCP Server"/>
  <img src="https://img.shields.io/badge/WebEngage-Integration-orange?style=for-the-badge" alt="WebEngage"/>
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License"/>
</p>

<h1 align="center">🚀 WebEngage MCP Server</h1>

<p align="center">
  <strong>Connect any AI assistant to the WebEngage platform through the Model Context Protocol</strong>
</p>

<p align="center">
  <em>Track users · Log events · Trigger campaigns — all through natural language</em>
</p>

<p align="center"><strong>Built with ❤️ by Shivam Tiwari</strong></p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [What is MCP?](#-what-is-mcp)
- [Features](#-features)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [Usage](#-usage)
  - [Claude Desktop](#1-claude-desktop)
  - [Cursor IDE](#2-cursor-ide)
  - [MCP Inspector](#3-mcp-inspector-debugging)
- [Available Tools](#-available-tools)
  - [webengage_track_user](#1-webengage_track_user)
  - [webengage_track_event](#2-webengage_track_event)
  - [webengage_trigger_campaign](#3-webengage_trigger_campaign)
  - [webengage_bulk_track_users](#4-webengage_bulk_track_users)
  - [webengage_bulk_track_events](#5-webengage_bulk_track_events)
- [Available Resources](#-available-resources)
- [Project Structure](#-project-structure)
- [Rate Limits](#-rate-limits)
- [Error Handling](#-error-handling)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**webengage-mcp** is a [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that acts as a bridge between AI assistants and the [WebEngage](https://webengage.com) customer engagement platform. It exposes WebEngage's REST API as structured MCP tools, allowing AI models to:

- **Create and update user profiles** with system and custom attributes
- **Track custom events** with rich metadata for analytics and segmentation
- **Trigger transactional campaigns** across push, SMS, email, WhatsApp, and web push
- **Perform bulk operations** for high-throughput data ingestion

Instead of writing API calls manually, simply tell your AI assistant what you need in plain English.

---

## 🤖 What is MCP?

The **Model Context Protocol (MCP)** is an open standard created by Anthropic that provides a universal way for AI models to interact with external tools and data sources. Think of it as a "USB-C port for AI" — one standardised interface that connects any AI client to any service.

```
┌─────────────────┐     MCP (JSON-RPC)     ┌──────────────────┐     REST API     ┌──────────────┐
│   AI Assistant   │◄──────────────────────►│  webengage-mcp   │◄───────────────►│   WebEngage   │
│ (Claude, Cursor) │       over stdio       │   MCP Server     │    over HTTPS   │   Platform    │
└─────────────────┘                         └──────────────────┘                 └──────────────┘
```

**Key MCP concepts used in this server:**

| Concept | Description | Example in this server |
|---------|-------------|----------------------|
| **Tools** | Actions the AI can invoke (write operations) | `webengage_track_user`, `webengage_track_event` |
| **Resources** | Read-only data for AI context | `webengage://credentials`, `webengage://api-reference` |
| **Transport** | Communication channel | `stdio` (standard input/output) |

---

## ✨ Features

### 🛠️ 5 MCP Tools
| Tool | WebEngage Endpoint | Description |
|------|-------------------|-------------|
| `webengage_track_user` | `POST /users` | Upsert user profiles |
| `webengage_track_event` | `POST /events` | Track custom events |
| `webengage_trigger_campaign` | `POST /transactions` | Send transactional campaigns |
| `webengage_bulk_track_users` | `POST /users/bulk` | Batch-upsert up to 100 users |
| `webengage_bulk_track_events` | `POST /events/bulk` | Batch-track up to 100 events |

### 📚 2 MCP Resources
| Resource URI | Description |
|-------------|-------------|
| `webengage://credentials` | Masked view of your active connection config |
| `webengage://api-reference` | Compact endpoint reference for AI context |

### 🔒 Security
- API keys are **never exposed** to the AI model — only a masked version is available via the credentials resource
- Bearer token authentication on all API calls
- Input validation via [Zod](https://zod.dev) schemas with descriptive error messages

### 🌍 Multi-Region Support
| Data Center | Host |
|-------------|------|
| Global (default) | `api.webengage.com` |
| India | `api.in.webengage.com` |
| Saudi Arabia | `api.sa.webengage.com` |

---

## 🏗️ Architecture

```
webengage-mcp/
│
├── src/index.ts          ← MCP Server bootstrap (stdio transport)
│       │
│       ├── Registers 5 Tools ─────────────────────────────────────────────┐
│       │   ├── track_user.ts        → POST /v1/accounts/{LC}/users       │
│       │   ├── track_event.ts       → POST /v1/accounts/{LC}/events      │
│       │   ├── trigger_campaign.ts  → POST /v1/accounts/{LC}/transactions│
│       │   ├── bulk_track_users.ts  → POST /v1/accounts/{LC}/users/bulk  │
│       │   └── bulk_track_events.ts → POST /v1/accounts/{LC}/events/bulk │
│       │                                                                  │
│       ├── Registers 2 Resources ─────────────────────────────────────────┤
│       │   ├── credentials.ts       → webengage://credentials            │
│       │   └── api_reference.ts     → webengage://api-reference          │
│       │                                                                  │
│       └── Uses ──────────────────────────────────────────────────────────┤
│           ├── config.ts            → Env variable loading & validation  │
│           └── client.ts            → Typed HTTP client (fetch-based)    │
│                                                                          │
└───────────────────────── All calls → WebEngage REST API ─────────────────┘
```

---

## 📋 Prerequisites

- **Node.js** ≥ 18 (uses native `fetch`)
- **npm** ≥ 9
- A **WebEngage account** with REST API access enabled
- Your **API Key** and **License Code** from the WebEngage dashboard

### Finding Your WebEngage Credentials

1. Log in to your [WebEngage Dashboard](https://dashboard.webengage.com)
2. Navigate to **Data Platform → Integrations → REST API**
3. Copy your **API Key** and **License Code**

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/shivamtiwari3/webengage-mcp.git
cd webengage-mcp

# Install dependencies
npm install

# Build the TypeScript source
npm run build
```

---

## ⚙️ Configuration

The server is configured entirely through environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `WEBENGAGE_API_KEY` | ✅ Yes | — | Your WebEngage REST API Bearer token |
| `WEBENGAGE_LICENSE_CODE` | ✅ Yes | — | Your WebEngage account license code |
| `WEBENGAGE_DC` | ❌ No | `global` | Data center region: `global`, `in`, or `sa` |

The server constructs the base URL automatically:
```
https://api.{dc}.webengage.com/v1/accounts/{LICENSE_CODE}
```

---

## 🔌 Usage

### 1. Claude Desktop

Add the following to your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "webengage": {
      "command": "node",
      "args": ["/absolute/path/to/webengage-mcp/dist/index.js"],
      "env": {
        "WEBENGAGE_API_KEY": "your_api_key_here",
        "WEBENGAGE_LICENSE_CODE": "your_license_code_here",
        "WEBENGAGE_DC": "in"
      }
    }
  }
}
```

Restart Claude Desktop. You should see a 🔌 icon indicating the MCP server is connected.

**Example prompts you can now use:**

| Prompt | Tool Invoked |
|--------|-------------|
| *"Track user shivam@example.com with name Shivam Tiwari"* | `webengage_track_user` |
| *"Log a Purchase event for user123 with amount ₹999 and category Electronics"* | `webengage_track_event` |
| *"Send the welcome email campaign to user456"* | `webengage_trigger_campaign` |
| *"Bulk import these 50 users from the spreadsheet"* | `webengage_bulk_track_users` |

### 2. Cursor IDE

Add to your Cursor MCP settings (`.cursor/mcp.json` in your project root):

```json
{
  "mcpServers": {
    "webengage": {
      "command": "node",
      "args": ["/absolute/path/to/webengage-mcp/dist/index.js"],
      "env": {
        "WEBENGAGE_API_KEY": "your_api_key_here",
        "WEBENGAGE_LICENSE_CODE": "your_license_code_here",
        "WEBENGAGE_DC": "in"
      }
    }
  }
}
```

### 3. MCP Inspector (Debugging)

The MCP Inspector provides a visual UI to test all tools and resources:

```bash
npx @modelcontextprotocol/inspector tsx src/index.ts
```

Open `http://localhost:5173` in your browser to interact with the server directly.

---

## 🔧 Available Tools

### 1. `webengage_track_user`

**Purpose:** Create or update a user profile in WebEngage.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | ✅ | Unique customer user ID (CUID) |
| `email` | string | ❌ | User's email address |
| `phone` | string | ❌ | Phone in E.164 format (e.g., `+919876543210`) |
| `firstName` | string | ❌ | First name |
| `lastName` | string | ❌ | Last name |
| `birthDate` | string | ❌ | Birth date in `YYYY-MM-DD` format |
| `gender` | enum | ❌ | `male`, `female`, or `other` |
| `company` | string | ❌ | Company/organization |
| `attributes` | object | ❌ | Custom key-value pairs |

**Example request:**
```json
{
  "userId": "user_001",
  "email": "shivam@example.com",
  "firstName": "Shivam",
  "lastName": "Tiwari",
  "phone": "+919876543210",
  "attributes": {
    "plan": "premium",
    "signup_source": "organic"
  }
}
```

**Example response:**
```json
{
  "success": true,
  "message": "User \"user_001\" tracked successfully",
  "response": { "status": "queued" }
}
```

---

### 2. `webengage_track_event`

**Purpose:** Track a custom user event for analytics, segmentation, and campaign triggers.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | ✅ | User ID who performed the event |
| `eventName` | string | ✅ | Event name (must **not** start with `we_`) |
| `eventTime` | string | ❌ | ISO 8601 timestamp (defaults to now) |
| `attributes` | object | ❌ | Event properties |

**Example request:**
```json
{
  "userId": "user_001",
  "eventName": "Product Purchased",
  "attributes": {
    "product_name": "Wireless Earbuds",
    "price": 2499,
    "currency": "INR",
    "category": "Electronics"
  }
}
```

> ⚠️ **Important:** Event names must **not** start with `we_` — that prefix is reserved for WebEngage system events.

---

### 3. `webengage_trigger_campaign`

**Purpose:** Trigger a transactional campaign for a specific user. The campaign must already be in **"Running"** state on the WebEngage dashboard.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `campaignId` | string | ✅ | Transactional campaign ID |
| `userId` | string | ✅ | Target user ID |
| `channel` | enum | ✅ | `push`, `sms`, `email`, `web_push`, or `whatsapp` |
| `tokens` | object | ❌ | Personalisation tokens for the template |

**Example request:**
```json
{
  "campaignId": "camp_order_confirm",
  "userId": "user_001",
  "channel": "email",
  "tokens": {
    "order_id": "ORD-12345",
    "delivery_date": "2026-02-25",
    "total_amount": "₹2,499"
  }
}
```

> 💡 **Tip:** Unlike marketing campaigns, transactional campaigns use personalisation tokens passed through the API instead of user attributes.

---

### 4. `webengage_bulk_track_users`

**Purpose:** Batch-upsert up to **100 user profiles** in a single API call.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `users` | array | ✅ | Array of user objects (min: 1, max: 100) |

Each user object supports: `userId` (required), `email`, `phone`, `firstName`, `lastName`, `attributes`.

**Example request:**
```json
{
  "users": [
    { "userId": "u1", "email": "a@test.com", "firstName": "Alice" },
    { "userId": "u2", "email": "b@test.com", "firstName": "Bob" },
    { "userId": "u3", "email": "c@test.com", "firstName": "Charlie" }
  ]
}
```

---

### 5. `webengage_bulk_track_events`

**Purpose:** Batch-track up to **100 events** in a single API call.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `events` | array | ✅ | Array of event objects (min: 1, max: 100) |

Each event object supports: `userId` (required), `eventName` (required), `eventTime`, `attributes`.

**Example request:**
```json
{
  "events": [
    { "userId": "u1", "eventName": "Page Viewed", "attributes": { "page": "/pricing" } },
    { "userId": "u2", "eventName": "Button Clicked", "attributes": { "button": "signup" } }
  ]
}
```

---

## 📚 Available Resources

### `webengage://credentials`

Returns a **masked** view of your current connection configuration. Useful for the AI to verify which account it's connected to without exposing sensitive keys.

**Example output:**
```markdown
# WebEngage Connection Info

- **License Code:** ~12a3b4c
- **Data Center:** in
- **API Key:** we_a****xyz9
- **Base URL:** https://api.in.webengage.com/v1/accounts/~12a3b4c
```

### `webengage://api-reference`

Returns a compact markdown reference of all WebEngage REST API endpoints, rate limits, and data constraints. This gives the AI model the context it needs to autonomously decide which tool to use for a given request.

---

## ⚡ Rate Limits

WebEngage enforces rate limits on its REST API. This server does **not** implement client-side rate limiting — requests are passed through to WebEngage directly.

| Endpoint | Rate Limit |
|----------|-----------|
| Track User (`POST /users`) | 5,000 req/min |
| Track Event (`POST /events`) | 5,000 req/min |
| Trigger Campaign (`POST /transactions`) | 100 req/min |
| Bulk Users (`POST /users/bulk`) | Per-account basis |
| Bulk Events (`POST /events/bulk`) | Per-account basis |

---

## 🚨 Error Handling

All tools return structured JSON responses. On failure, you'll get:

```json
{
  "error": "WebEngage API error [401] POST /users: {\"message\":\"Invalid API key\"}"
}
```

Common error scenarios:

| HTTP Status | Cause | Solution |
|-------------|-------|----------|
| `401` | Invalid API key | Check `WEBENGAGE_API_KEY` |
| `403` | Insufficient permissions | Verify API key has admin access |
| `404` | Invalid license code | Check `WEBENGAGE_LICENSE_CODE` |
| `429` | Rate limit exceeded | Reduce request frequency |
| `400` | Invalid request body | Check tool input parameters |

---

## 💻 Development

```bash
# Run in development mode (auto-restarts on changes)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Test with MCP Inspector
npx @modelcontextprotocol/inspector tsx src/index.ts
```

### Tech Stack

| Technology | Purpose |
|-----------|---------|
| [TypeScript 5.7](https://www.typescriptlang.org/) | Type-safe development |
| [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk) | MCP server framework |
| [Zod](https://zod.dev) | Runtime input validation & schema generation |
| [Node.js 18+](https://nodejs.org/) | Runtime (uses native `fetch`) |

---

## 🔍 Troubleshooting

### Server won't start
- Ensure `WEBENGAGE_API_KEY` and `WEBENGAGE_LICENSE_CODE` are set
- Verify Node.js ≥ 18: `node --version`
- Run `npm run build` first if using `npm start`

### Tools not appearing in Claude Desktop
- Verify the config file path is correct for your OS
- Ensure the `args` path in config is an **absolute path** to `dist/index.js`
- Restart Claude Desktop completely after config changes
- Check Claude Desktop logs for MCP errors

### API calls returning 401
- Regenerate your API key from WebEngage Dashboard → Data Platform → Integrations → REST API
- Ensure you're using the correct data center (`global`, `in`, or `sa`)

### Campaign trigger returning 400
- The campaign must be in **"Running"** state on the WebEngage dashboard
- Verify the `campaignId` is correct
- Ensure the `channel` matches the campaign type

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Ideas for Future Tools

- 📊 `webengage_get_segment` — Fetch user segment data
- 📈 `webengage_campaign_stats` — Get campaign performance metrics
- 🔔 `webengage_create_campaign` — Create campaigns programmatically
- 🗑️ `webengage_delete_user` — GDPR-compliant user deletion

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with ❤️ by Shivam Tiwari</strong><br/>
  <sub>Powered by <a href="https://modelcontextprotocol.io">Model Context Protocol</a> · <a href="https://webengage.com">WebEngage</a></sub>
</p>
