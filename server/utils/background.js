// Fire-and-forget work (e.g. sending an email after a request has already
// been responded to) needs different handling depending on where we're
// running:
//
// - Plain Node (server.js, local dev, Render): the process just keeps
//   running, so setImmediate() is enough to defer the work slightly without
//   blocking the response.
// - Cloudflare Workers (src/worker.js): the runtime can freeze or tear down
//   a request's execution context as soon as the response is sent. Anything
//   scheduled with setImmediate() after that point may simply never run.
//   Workers' own waitUntil() (importable directly from `cloudflare:workers`,
//   no need to thread `ctx` through Express) tells the runtime to keep the
//   Worker alive until the given promise settles (up to 30s), which is
//   exactly what background email sends need.
//
// This mirrors the runtime-detection pattern already used in
// config/database.js, so both entry points keep working unchanged.

let cachedWaitUntil = null;
let detected = false;

async function getWaitUntil() {
  if (detected) return cachedWaitUntil;
  detected = true;
  try {
    const { waitUntil } = await import('cloudflare:workers');
    cachedWaitUntil = waitUntil;
  } catch {
    cachedWaitUntil = null;
  }
  return cachedWaitUntil;
}

// Runs `fn` (a function returning a promise) in the background without
// delaying or being awaited by the caller. On Workers this keeps the
// runtime alive until `fn()` settles; on Node it just defers to the next
// tick, matching the previous setImmediate() behavior.
export function runInBackground(fn) {
  getWaitUntil().then((waitUntil) => {
    if (waitUntil) {
      waitUntil(
        Promise.resolve()
          .then(fn)
          .catch((err) => console.error('Background task failed:', err.message))
      );
    } else {
      setImmediate(() => {
        Promise.resolve()
          .then(fn)
          .catch((err) => console.error('Background task failed:', err.message));
      });
    }
  });
}
