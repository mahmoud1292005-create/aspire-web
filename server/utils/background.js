// Fire-and-forget work (e.g. sending an email after a request has already
// been responded to) needs different handling depending on where we're
// running:
//
// - Plain Node (server.js, local dev, Render): the process just keeps
//   running, so just letting the promise run in the background is enough.
// - Cloudflare Workers (src/worker.js): the runtime can freeze or tear
//   down a request's execution context as soon as the response is sent.
//   ctx.waitUntil() is Cloudflare's mechanism for telling the runtime to
//   stay alive until a given promise settles (up to 30s) - exactly what
//   background email sends need.
//
// Getting the ctx: src/worker.js stashes each request's ctx in
// executionContextStorage (AsyncLocalStorage) right when the request comes
// in. We read it back out *synchronously* here - no dynamic import, no
// async gap - because AsyncLocalStorage.getStore() resolves immediately
// and correctly follows the async call chain Node/Workers already tracks
// for us. (An earlier version of this file used a dynamic
// `import('cloudflare:workers')` instead; that introduced a delay before
// waitUntil() was actually called, and the Worker could tear the request
// down before that resolved - which silently dropped the background work
// entirely. Don't reintroduce that pattern here.)
import { executionContextStorage } from './executionContext.js';

// Runs `fn` (a function returning a promise) in the background without
// delaying or being awaited by the caller.
export function runInBackground(fn) {
  const promise = Promise.resolve()
    .then(fn)
    .catch((err) => console.error('Background task failed:', err.message));

  const ctx = executionContextStorage.getStore();
  if (ctx && typeof ctx.waitUntil === 'function') {
    ctx.waitUntil(promise);
  }
  // On plain Node there's no ctx - the promise above is already scheduled
  // and the process stays alive on its own, so there's nothing more to do.
}
