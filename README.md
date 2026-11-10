# dlvrd-sf-token

A static page that signs a DLVRD administrator in to Salesforce (their own login, with MFA) using the OAuth 2.0 authorization-code flow with PKCE, and shows a short-lived access token for an urgent production change.

Served by GitHub Pages at `https://dlvrd.github.io/dlvrd-sf-token/`.

**It holds no secret.** PKCE replaces the client secret, and a connected app's consumer key is public by design. The token is shown on screen only; it is never stored, logged, or sent anywhere except back to Salesforce (for revoke). A Content-Security-Policy restricts the page to talking to the org's My Domain.

The source of record and the setup runbook are kept in a private repository; change the files there first and copy them here.
