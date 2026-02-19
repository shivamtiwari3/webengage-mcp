/**
 * WebEngage REST API Client
 * Built by Shivam Tiwari
 *
 * Thin typed wrapper around the WebEngage REST API.
 * All methods throw on non-2xx responses with structured error details.
 */

import { WebEngageConfig } from "./config.js";

export interface ApiResponse {
    status: number;
    body: Record<string, unknown>;
}

export class WebEngageClient {
    private baseUrl: string;
    private headers: Record<string, string>;

    constructor(private config: WebEngageConfig) {
        this.baseUrl = config.baseUrl;
        this.headers = {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
        };
    }

    // ─── User Tracking ──────────────────────────────────────────────

    async trackUser(userId: string, attributes: Record<string, unknown>): Promise<ApiResponse> {
        return this.request("POST", "/users", {
            userId,
            ...attributes,
        });
    }

    // ─── Event Tracking ─────────────────────────────────────────────

    async trackEvent(
        userId: string,
        eventName: string,
        eventData?: Record<string, unknown>,
        eventTime?: string
    ): Promise<ApiResponse> {
        const body: Record<string, unknown> = {
            userId,
            eventName,
        };
        if (eventData) body.eventData = eventData;
        if (eventTime) body.eventTime = eventTime;
        return this.request("POST", "/events", body);
    }

    // ─── Transactional Campaigns ────────────────────────────────────

    async triggerCampaign(
        campaignId: string,
        userId: string,
        channel: string,
        tokens?: Record<string, unknown>
    ): Promise<ApiResponse> {
        const body: Record<string, unknown> = {
            campaignId,
            userId,
            channel,
        };
        if (tokens) body.tokens = tokens;
        return this.request("POST", "/transactions", body);
    }

    // ─── Bulk Operations ────────────────────────────────────────────

    async bulkTrackUsers(users: Record<string, unknown>[]): Promise<ApiResponse> {
        return this.request("POST", "/users/bulk", { users });
    }

    async bulkTrackEvents(events: Record<string, unknown>[]): Promise<ApiResponse> {
        return this.request("POST", "/events/bulk", { events });
    }

    // ─── Internal HTTP Helper ───────────────────────────────────────

    private async request(
        method: string,
        path: string,
        body?: Record<string, unknown>
    ): Promise<ApiResponse> {
        const url = `${this.baseUrl}${path}`;

        const response = await fetch(url, {
            method,
            headers: this.headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        let responseBody: Record<string, unknown>;
        try {
            responseBody = (await response.json()) as Record<string, unknown>;
        } catch {
            responseBody = { raw: await response.text() };
        }

        if (!response.ok) {
            throw new Error(
                `WebEngage API error [${response.status}] ${method} ${path}: ${JSON.stringify(responseBody)}`
            );
        }

        return { status: response.status, body: responseBody };
    }
}
