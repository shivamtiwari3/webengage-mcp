/**
 * Tool: webengage_track_user
 * Upserts a user profile in WebEngage.
 * Built by Shivam Tiwari
 */

import { z } from "zod";
import { WebEngageClient } from "../client.js";

export const trackUserSchema = z.object({
    userId: z.string().describe("Unique customer user ID (CUID)"),
    email: z.string().email().optional().describe("User email address"),
    phone: z.string().optional().describe("Phone number in E.164 format, e.g. +919876543210"),
    firstName: z.string().optional().describe("User's first name"),
    lastName: z.string().optional().describe("User's last name"),
    birthDate: z.string().optional().describe("Birth date in YYYY-MM-DD format"),
    gender: z.enum(["male", "female", "other"]).optional().describe("User gender"),
    company: z.string().optional().describe("Company/organization name"),
    attributes: z.record(z.unknown()).optional().describe("Custom user attributes as key-value pairs"),
});

export type TrackUserInput = z.infer<typeof trackUserSchema>;

export async function handleTrackUser(
    client: WebEngageClient,
    input: TrackUserInput
): Promise<string> {
    const { userId, attributes, ...systemAttrs } = input;

    const userPayload: Record<string, unknown> = {};

    // Map system attributes
    if (systemAttrs.email) userPayload.we_email = systemAttrs.email;
    if (systemAttrs.phone) userPayload.we_phone = systemAttrs.phone;
    if (systemAttrs.firstName) userPayload.we_first_name = systemAttrs.firstName;
    if (systemAttrs.lastName) userPayload.we_last_name = systemAttrs.lastName;
    if (systemAttrs.birthDate) userPayload.we_birth_date = systemAttrs.birthDate;
    if (systemAttrs.gender) userPayload.we_gender = systemAttrs.gender;
    if (systemAttrs.company) userPayload.we_company = systemAttrs.company;

    // Merge custom attributes
    if (attributes) {
        Object.assign(userPayload, attributes);
    }

    const result = await client.trackUser(userId, userPayload);

    return JSON.stringify(
        {
            success: true,
            message: `User "${userId}" tracked successfully`,
            response: result.body,
        },
        null,
        2
    );
}
