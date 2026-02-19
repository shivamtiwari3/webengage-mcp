#!/usr/bin/env node
/**
 * ┌──────────────────────────────────────────────┐
 * │  WebEngage MCP Server                        │
 * │  Built with ❤️ by Shivam Tiwari               │
 * │                                              │
 * │  Connects any MCP-compatible AI client to    │
 * │  the WebEngage platform — track users,       │
 * │  events, and trigger transactional campaigns │
 * │  through natural language.                   │
 * └──────────────────────────────────────────────┘
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { loadConfig } from "./config.js";
import { WebEngageClient } from "./client.js";

// Tools
import { trackUserSchema, handleTrackUser } from "./tools/track_user.js";
import { trackEventSchema, handleTrackEvent } from "./tools/track_event.js";
import { triggerCampaignSchema, handleTriggerCampaign } from "./tools/trigger_campaign.js";
import { bulkTrackUsersSchema, handleBulkTrackUsers } from "./tools/bulk_track_users.js";
import { bulkTrackEventsSchema, handleBulkTrackEvents } from "./tools/bulk_track_events.js";

// Resources
import { getCredentialsContent } from "./resources/credentials.js";
import { getApiReferenceContent } from "./resources/api_reference.js";

// ─── Bootstrap ────────────────────────────────────────────────────

async function main() {
    const config = loadConfig();
    const client = new WebEngageClient(config);

    const server = new McpServer({
        name: "webengage-mcp",
        version: "1.0.0",
        description:
            "WebEngage MCP Server — Track users, events, and trigger campaigns. Built by Shivam Tiwari.",
    });

    // ─── Register Tools ───────────────────────────────────────────

    server.tool(
        "webengage_track_user",
        "Create or update a user profile in WebEngage. Use this to set user attributes like email, phone, name, and custom properties.",
        trackUserSchema.shape,
        async (input) => ({
            content: [{ type: "text", text: await handleTrackUser(client, input) }],
        })
    );

    server.tool(
        "webengage_track_event",
        "Track a custom event for a user in WebEngage. Events are used for analytics, segmentation, and campaign triggers. Event names must NOT start with 'we_'.",
        trackEventSchema.shape,
        async (input) => ({
            content: [{ type: "text", text: await handleTrackEvent(client, input) }],
        })
    );

    server.tool(
        "webengage_trigger_campaign",
        "Trigger a transactional campaign (push, SMS, email, web push, or WhatsApp) for a specific user. The campaign must already be in 'Running' state on the WebEngage dashboard.",
        triggerCampaignSchema.shape,
        async (input) => ({
            content: [{ type: "text", text: await handleTriggerCampaign(client, input) }],
        })
    );

    server.tool(
        "webengage_bulk_track_users",
        "Bulk-create or update up to 100 user profiles in a single call. More efficient than individual calls for batch operations.",
        bulkTrackUsersSchema.shape,
        async (input) => ({
            content: [{ type: "text", text: await handleBulkTrackUsers(client, input) }],
        })
    );

    server.tool(
        "webengage_bulk_track_events",
        "Bulk-track up to 100 custom events in a single call. More efficient than individual calls for batch operations.",
        bulkTrackEventsSchema.shape,
        async (input) => ({
            content: [{ type: "text", text: await handleBulkTrackEvents(client, input) }],
        })
    );

    // ─── Register Resources ───────────────────────────────────────

    server.resource(
        "credentials",
        "webengage://credentials",
        {
            description:
                "Shows the currently configured WebEngage account credentials (API key is masked for security).",
            mimeType: "text/markdown",
        },
        async () => ({
            contents: [
                {
                    uri: "webengage://credentials",
                    mimeType: "text/markdown",
                    text: getCredentialsContent(config),
                },
            ],
        })
    );

    server.resource(
        "api-reference",
        "webengage://api-reference",
        {
            description:
                "Compact reference of all WebEngage REST API endpoints, rate limits, and data constraints.",
            mimeType: "text/markdown",
        },
        async () => ({
            contents: [
                {
                    uri: "webengage://api-reference",
                    mimeType: "text/markdown",
                    text: getApiReferenceContent(),
                },
            ],
        })
    );

    // ─── Start Server ─────────────────────────────────────────────

    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error("🚀 WebEngage MCP Server running (stdio) — Built by Shivam Tiwari");
}

main().catch((error) => {
    console.error("Fatal error starting WebEngage MCP Server:", error);
    process.exit(1);
});
