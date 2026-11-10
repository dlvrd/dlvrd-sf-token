// Public configuration. Nothing here is secret: with PKCE there is no client
// secret, and a connected app's consumer key is designed to be public.
window.SF_TOKEN_CONFIG = {
  // The org's My Domain. Must match connect-src in index.html's CSP.
  loginHost: 'https://dlvrd.my.salesforce.com',
  // The connected app's Consumer Key. External Client App DLVRD_Remote_Token (10 Nov 2026).
  clientId: '3MVG9U65ySgtae72Dik6fNf9P1adtUmFLnv6EQ8rLsBtJll85KvH8xQ5IoQPNAihrIeoXoskymQ==',
  // Must equal the connected app's Callback URL exactly, trailing slash included.
  redirectUri: 'https://dlvrd.github.io/dlvrd-sf-token/',
  scope: 'api'
};
