// Cloudflare's ExecutionContext (ctx), which gives us ctx.waitUntil(), is
// only handed to us at the top-level fetch() handler in src/worker.js.
// Express route handlers deep inside app.js/controllers/services have no
// direct access to it.
//
// AsyncLocalStorage lets us stash ctx once per request, at the top, and
// read it back out synchronously from anywhere in that request's async
// call chain (services, background tasks, etc.) - no passing ctx through
// every function signature, and critically, no async gap between "decide
// we need ctx" and "use it", which is what made a dynamic
// `import('cloudflare:workers')` unreliable for this: the Worker can tear
// down the request's execution context before an async import resolves.
//
// On plain Node (server.js) nothing ever calls `.run()` on this, so
// `getStore()` just returns undefined - background.js falls back to
// letting the promise run normally, which is fine because the Node
// process itself stays alive.
import { AsyncLocalStorage } from 'node:async_hooks';

export const executionContextStorage = new AsyncLocalStorage();
