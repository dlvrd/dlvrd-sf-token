// Public configuration. Nothing here is secret: with PKCE there is no client
// secret, and a connected app's consumer key is designed to be public.
window.SF_TOKEN_CONFIG = {
  // The org's My Domain. Must match connect-src in index.html's CSP.
  loginHost: 'https://dlvrd.my.salesforce.com',
  // The connected app's Consumer Key. Fill in after creating the app (runbook step 1).
  clientId: 'REPLACE_WITH_CONSUMER_KEY',
  // Must equal the connected app's Callback URL exactly, trailing slash included.
  redirectUri: 'https://dlvrd.github.io/dlvrd-sf-token/',
  scope: 'api'
};
