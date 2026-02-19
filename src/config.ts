/**
 * WebEngage MCP Server — Configuration
 * Built by Shivam Tiwari
 */

export interface WebEngageConfig {
    apiKey: string;
    licenseCode: string;
    baseUrl: string;
    dataCenter: "global" | "in" | "sa";
}

const DC_HOSTS: Record<string, string> = {
    global: "https://api.webengage.com",
    in: "https://api.in.webengage.com",
    sa: "https://api.sa.webengage.com",
};

export function loadConfig(): WebEngageConfig {
    const apiKey = process.env.WEBENGAGE_API_KEY;
    if (!apiKey) {
        throw new Error(
            "Missing WEBENGAGE_API_KEY environment variable. " +
            "Find it in WebEngage Dashboard → Data Platform → Integrations → REST API."
        );
    }

    const licenseCode = process.env.WEBENGAGE_LICENSE_CODE;
    if (!licenseCode) {
        throw new Error(
            "Missing WEBENGAGE_LICENSE_CODE environment variable. " +
            "Find it in WebEngage Dashboard → Account Settings."
        );
    }

    const dc = (process.env.WEBENGAGE_DC || "global").toLowerCase();
    if (!["global", "in", "sa"].includes(dc)) {
        throw new Error(
            `Invalid WEBENGAGE_DC value: "${dc}". Must be one of: global, in, sa`
        );
    }

    const dataCenter = dc as WebEngageConfig["dataCenter"];
    const host = DC_HOSTS[dataCenter];
    const baseUrl = `${host}/v1/accounts/${licenseCode}`;

    return { apiKey, licenseCode, baseUrl, dataCenter };
}
