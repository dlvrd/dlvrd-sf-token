// OAuth 2.0 authorization-code flow with PKCE, entirely in the browser.
// The token is shown on screen and copied by the user. It is never written to
// storage, logged, or sent anywhere except back to Salesforce (for Revoke).
(function () {
  'use strict';
  var C = window.SF_TOKEN_CONFIG;
  var $ = function (id) { return document.getElementById(id); };
  var KEY = 'sf_pkce';   // sessionStorage: verifier + state only, removed after use

  function show(id) {
    ['start', 'busy', 'done', 'error'].forEach(function (s) { $(s).hidden = (s !== id); });
  }
  function fail(msg) { $('errmsg').textContent = msg; show('error'); }

  function b64url(bytes) {
    var s = '';
    bytes.forEach(function (b) { s += String.fromCharCode(b); });
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function randomString(n) { var a = new Uint8Array(n); crypto.getRandomValues(a); return b64url(a); }
  async function challenge(verifier) {
    var d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    return b64url(new Uint8Array(d));
  }

  async function begin() {
    if (!C || !C.clientId || C.clientId.indexOf('REPLACE_') === 0) {
      return fail('This page is not configured yet: config.js has no Consumer Key.');
    }
    var verifier = randomString(64), state = randomString(16);
    sessionStorage.setItem(KEY, JSON.stringify({ v: verifier, s: state }));
    var q = new URLSearchParams({
      response_type: 'code', client_id: C.clientId, redirect_uri: C.redirectUri,
      scope: C.scope, state: state,
      code_challenge: await challenge(verifier), code_challenge_method: 'S256'
    });
    location.assign(C.loginHost + '/services/oauth2/authorize?' + q.toString());
  }

  async function finish(params) {
    show('busy');
    var saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { saved = null; }
    sessionStorage.removeItem(KEY);
    history.replaceState(null, '', location.pathname);       // drop ?code= from the address bar and history
    if (!saved || saved.s !== params.get('state')) {
      return fail('Sign-in state did not match. Start again from this page.');
    }
    var body = new URLSearchParams({
      grant_type: 'authorization_code', code: params.get('code'),
      client_id: C.clientId, redirect_uri: C.redirectUri, code_verifier: saved.v
    });
    var res, data;
    try {
      res = await fetch(C.loginHost + '/services/oauth2/token', {
        method: 'POST', body: body, credentials: 'omit', cache: 'no-store'
      });
      data = await res.json();
    } catch (e) {
      return fail('Could not reach Salesforce to exchange the code (network or CORS). See the runbook, step 3.');
    }
    if (!res.ok || !data.access_token) {
      return fail('Salesforce refused the exchange: ' + (data.error_description || data.error || res.status));
    }
    $('token').value = data.access_token;
    var when = data.issued_at ? new Date(Number(data.issued_at)).toLocaleString() : 'now';
    $('meta').textContent = 'Issued ' + when + ' for ' + (data.instance_url || C.loginHost) +
      (data.refresh_token ? ' — WARNING: a refresh token was also issued; the connected app is misconfigured (runbook step 1).' : '.');
    show('done');
  }

  async function copy() {
    try { await navigator.clipboard.writeText($('token').value); $('copy').textContent = 'Copied'; }
    catch (e) { $('token').select(); $('copy').textContent = 'Select and copy manually'; }
  }

  async function revoke() {
    var t = $('token').value;
    if (!t) return;
    try {
      var r = await fetch(C.loginHost + '/services/oauth2/revoke', {
        method: 'POST', body: new URLSearchParams({ token: t }), credentials: 'omit', cache: 'no-store'
      });
      $('token').value = '';
      $('meta').textContent = r.ok ? 'Revoked. The token no longer works. Now sign out of Salesforce in this browser, or close this private tab: Revoke does not end that sign-in.' : 'Revoke returned ' + r.status + ' — let the session time out or end it in Setup → Session Management.';
    } catch (e) {
      $('meta').textContent = 'Could not reach Salesforce to revoke. End the session in Setup → Session Management.';
    }
  }

  $('go').addEventListener('click', begin);
  $('retry').addEventListener('click', function () { show('start'); });
  $('copy').addEventListener('click', copy);
  $('revoke').addEventListener('click', revoke);

  var p = new URLSearchParams(location.search);
  if (p.get('error')) { history.replaceState(null, '', location.pathname); fail('Salesforce returned: ' + (p.get('error_description') || p.get('error'))); }
  else if (p.get('code')) { finish(p); }
  else { show('start'); }
})();
