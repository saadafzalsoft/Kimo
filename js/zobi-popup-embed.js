/*
 * Zobi popup embed: load this store's scratch-card popup.
 *
 * Asks <root>apps/zobi/popup-src (Shopify's app proxy, so the request is signed for this shop and
 * the answer can only be this store's) for the popup script, then adds it to the page. That is the
 * same zobi-popup.js / zobi-popup-eu.js a ScriptTag used to load, with ?brand=<brand>; the popup
 * itself decides everything else (enabled, pages, desktop, exit intent, frequency).
 *
 * It adds nothing when the answer is empty (the popup is off or the store has none), when the
 * answer is not an https URL, on any error, or when a popup is already on the page: the popup
 * widgets share the window.__zobiPopupLoaded guard, so a store that still has its old ScriptTag
 * never shows two takeovers.
 *
 * The ask carries zobi_embed=1: only an ask with it (from a browser) tells Zobi the embed is on this
 * store (engine/storefront/embed_seen.py), so a hand-made request to the proxy URL proves nothing.
 *
 * <root> is Shopify's locale root ("/" or "/fr/"): window.Shopify.routes.root when the theme
 * exposes it, else the part of location.pathname before "/apps/".
 * No storage, no cookies, no secrets.
 */
(function () {
  'use strict';

  if (window.__zobiPopupEmbed) { return; }
  window.__zobiPopupEmbed = true;

  var SRC_PATH = 'apps/zobi/popup-src?zobi_embed=1';

  function root() {
    var shopify = window.Shopify;
    var declared = shopify && shopify.routes && shopify.routes.root;
    if (typeof declared === 'string' && declared.charAt(0) === '/') {
      return declared.charAt(declared.length - 1) === '/' ? declared : declared + '/';
    }
    var path = window.location.pathname;
    var at = path.indexOf('/apps/');
    return at >= 0 ? path.slice(0, at + 1) : '/';
  }

  function load(src) {
    if (window.__zobiPopupLoaded) { return; }
    if (typeof src !== 'string' || src.indexOf('https://') !== 0) { return; }
    var tag = document.createElement('script');
    tag.src = src;
    tag.async = true;
    (document.head || document.documentElement).appendChild(tag);
  }

  if (window.__zobiPopupLoaded || typeof window.fetch !== 'function') { return; }
  window.fetch(root() + SRC_PATH, { credentials: 'same-origin', headers: { Accept: 'application/json' } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) { load(data && data.src); })
    .catch(function () {});
})();
