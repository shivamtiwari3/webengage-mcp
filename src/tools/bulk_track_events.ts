/**
 * Tool: webengage_bulk_track_events
 * Bulk-tracks up to 100 events in a single API call.
 * Built by Shivam Tiwari
 */

import { z } from "zod";
import { WebEngageClient } from "../client.js";

const eventObjectSchema = z.object({
    userId: z.string().describe("User ID who performed the event"),
    eventName: z.string().describe("Custom event name (must not start with 'we_')"),
    eventTime: z.string().optional().describe("ISO 8601 timestamp"),
    attributes: z.record(z.unknown()).optional().describe("Event attributes"),
});

export const bulkTrackEventsSchema = z.object({
    events: z
        .array(eventObjectSchema)
        .min(1)
        .max(100)
        .describe("Array of event objects to track (max 100)"),
});

export type BulkTrackEventsInput = z.infer<typeof bulkTrackEventsSchema>;

export async function handleBulkTrackEvents(
    client: WebEngageClient,
    input: BulkTrackEventsInput
): Promise<string> {
    const mappedEvents = input.events.map(({ userId, eventName, eventTime, attributes }) => {
        const event: Record<string, unknown> = { userId, eventName };
        if (eventTime) event.eventTime = eventTime;
        if (attributes) event.eventData = attributes;
        return event;
    });

    const result = await client.bulkTrackEvents(mappedEvents);

    return JSON.stringify(
        {
            success: true,
            message: `${input.events.length} events tracked in bulk`,
            response: result.body,
        },
        null,
        2
    );
}
