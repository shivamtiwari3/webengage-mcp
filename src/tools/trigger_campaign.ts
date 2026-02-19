/**
 * Tool: webengage_trigger_campaign
 * Triggers a transactional campaign in WebEngage.
 * Built by Shivam Tiwari
 */

import { z } from "zod";
import { WebEngageClient } from "../client.js";

export const triggerCampaignSchema = z.object({
    campaignId: z
        .string()
        .describe("The transactional campaign ID. Campaign must be in 'Running' state on WebEngage dashboard."),
    userId: z.string().describe("The target user ID (CUID) to send the campaign to"),
    channel: z
        .enum(["push", "sms", "email", "web_push", "whatsapp"])
        .describe("The delivery channel for the campaign"),
    tokens: z
        .record(z.unknown())
        .optional()
        .describe("Personalisation tokens as key-value pairs to inject into the campaign template"),
});

export type TriggerCampaignInput = z.infer<typeof triggerCampaignSchema>;

export async function handleTriggerCampaign(
    client: WebEngageClient,
    input: TriggerCampaignInput
): Promise<string> {
    const result = await client.triggerCampaign(
        input.campaignId,
        input.userId,
        input.channel,
        input.tokens
    );

    return JSON.stringify(
        {
            success: true,
            message: `Campaign "${input.campaignId}" triggered for user "${input.userId}" via ${input.channel}`,
            response: result.body,
        },
        null,
        2
    );
}
