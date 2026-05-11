// Cloudflare Worker for acquiro.media
//
// Routes (Phase 1.5+):
//   POST /api/capi              — client-triggered Meta CAPI forward (browser)
//   POST /api/webhooks/iclosed  — iClosed webhook → Meta CAPI Lead (server-side)
//
// Every other request falls through to the static assets bundle. The `ASSETS`
// binding + directory are set in wrangler.jsonc.
//
// Secrets (set via `wrangler secret put` or the Cloudflare dashboard):
//   META_CAPI_TOKEN          — Meta CAPI access token
//   META_CAPI_TEST_CODE      — optional; if set, all CAPI events carry it so
//                              they surface in Events Manager → Test events
//   ICLOSED_WEBHOOK_SECRET   — random token required in ?token= on webhook URL
//
// Phase 0: Worker is a pass-through. Routes are added when CAPI work begins.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Reserved /api/* prefix — return 404 for now so we know nothing is calling
    // these routes prematurely. Real handlers land in Phase 1.5.
    if (url.pathname.startsWith('/api/')) {
      return new Response('Not Found', { status: 404 });
    }

    // Fall through to static assets.
    return env.ASSETS.fetch(request);
  },
};
