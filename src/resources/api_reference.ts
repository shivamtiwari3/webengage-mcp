/**
 * Resource: webengage://api-reference
 * Compact API reference for the AI to understand available endpoints.
 * Built by Shivam Tiwari
 */

export function getApiReferenceContent(): string {
    return `# WebEngage REST API — Quick Reference

## Authentication
All requests use \`Authorization: Bearer <API_KEY>\` header.

## Endpoints

### Track User — \`POST /users\`
Upsert a user profile. System attributes use \`we_\` prefix (we_email, we_phone, etc.).
- **Rate limit:** 5,000 req/min
- **Key fields:** userId (required), we_email, we_phone, we_first_name, we_last_name, we_birth_date, we_gender, we_company

### Track Event — \`POST /events\`
Track a custom user event.
- **Rate limit:** 5,000 req/min
- **Key fields:** userId (required), eventName (required, must NOT start with 'we_'), eventData (optional object), eventTime (optional ISO 8601)

### Trigger Transactional Campaign — \`POST /transactions\`
Send transactional messages. Campaign must be in "Running" state on the dashboard.
- **Rate limit:** 100 req/min
- **Channels:** push, sms, email, web_push, whatsapp
- **Key fields:** campaignId (required), userId (required), channel (required), tokens (optional personalisation)

### Bulk Track Users — \`POST /users/bulk\`
Upsert up to 100 users in one call.

### Bulk Track Events — \`POST /events/bulk\`
Track up to 100 events in one call.

## Data Constraints
- Custom event names: max 50 chars, avoid 'we_' prefix
- Custom attribute keys: max 50 chars
- String attribute values: max 1000 chars
- Nested attributes: max 5 levels deep

## Data Centers
| Region | Host |
|--------|------|
| Global | api.webengage.com |
| India  | api.in.webengage.com |
| Saudi Arabia | api.sa.webengage.com |

---
*Built by Shivam Tiwari*
`;
}
