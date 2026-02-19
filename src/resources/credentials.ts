/**
 * Resource: webengage://credentials
 * Returns a masked view of configured credentials.
 * Built by Shivam Tiwari
 */

import { WebEngageConfig } from "../config.js";

export function getCredentialsContent(config: WebEngageConfig): string {
    const maskedKey =
        config.apiKey.length > 8
            ? config.apiKey.slice(0, 4) + "****" + config.apiKey.slice(-4)
            : "****";

    return [
        "# WebEngage Connection Info",
        "",
        `- **License Code:** ${config.licenseCode}`,
        `- **Data Center:** ${config.dataCenter}`,
        `- **API Key:** ${maskedKey}`,
        `- **Base URL:** ${config.baseUrl}`,
        "",
        "> This resource shows your active WebEngage configuration.",
        "> API key is partially masked for security.",
    ].join("\n");
}
