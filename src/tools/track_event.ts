/**
 * Tool: webengage_track_event
 * Tracks a custom event in WebEngage.
 * Built by Shivam Tiwari
 */

import { z } from "zod";
import { WebEngageClient } from "../client.js";

export const trackEventSchema = z.object({
    userId: z.string().describe("The user ID (CUID) who performed the event"),
    eventName: z
        .string()
        .refine((name) => !name.startsWith("we_"), {
            message: "Event names must not start with 'we_' — that prefix is reserved by WebEngage",
        })
        .describe("Name of the custom event, e.g. 'Product Viewed', 'Added To Cart'"),
    eventTime: z
        .string()
        .optional()
        .describe("ISO 8601 timestamp of when the event occurred. Defaults to now."),
    attributes: z
        .record(z.unknown())
        .optional()
        .describe("Event attributes as key-value pairs, e.g. { price: 999, category: 'Electronics' }"),
});

export type TrackEventInput = z.infer<typeof trackEventSchema>;

export async function handleTrackEvent(
    client: WebEngageClient,
    input: TrackEventInput
): Promise<string> {
    const result = await client.trackEvent(
        input.userId,
        input.eventName,
        input.attributes,
        input.eventTime
    );

    return JSON.stringify(
        {
            success: true,
            message: `Event "${input.eventName}" tracked for user "${input.userId}"`,
            response: result.body,
        },
        null,
        2
    );
}
