/**
 * Tool: webengage_bulk_track_users
 * Bulk-upserts up to 100 user profiles in a single API call.
 * Built by Shivam Tiwari
 */

import { z } from "zod";
import { WebEngageClient } from "../client.js";

const userObjectSchema = z.object({
    userId: z.string().describe("Unique customer user ID"),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    attributes: z.record(z.unknown()).optional(),
});

export const bulkTrackUsersSchema = z.object({
    users: z
        .array(userObjectSchema)
        .min(1)
        .max(100)
        .describe("Array of user objects to upsert (max 100)"),
});

export type BulkTrackUsersInput = z.infer<typeof bulkTrackUsersSchema>;

export async function handleBulkTrackUsers(
    client: WebEngageClient,
    input: BulkTrackUsersInput
): Promise<string> {
    // Map friendly names to WebEngage system attribute names
    const mappedUsers = input.users.map(({ userId, email, phone, firstName, lastName, attributes }) => {
        const user: Record<string, unknown> = { userId };
        if (email) user.we_email = email;
        if (phone) user.we_phone = phone;
        if (firstName) user.we_first_name = firstName;
        if (lastName) user.we_last_name = lastName;
        if (attributes) Object.assign(user, attributes);
        return user;
    });

    const result = await client.bulkTrackUsers(mappedUsers);

    return JSON.stringify(
        {
            success: true,
            message: `${input.users.length} users tracked in bulk`,
            response: result.body,
        },
        null,
        2
    );
}
