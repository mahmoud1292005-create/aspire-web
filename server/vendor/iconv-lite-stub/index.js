// Minimal stand-in for iconv-lite.
//
// Why this exists: Cloudflare Workers' bundler currently crashes at startup
// ("Uncaught TypeError: require_streams(...) is not a function") when the
// real iconv-lite package is bundled, because of how its optional streaming
// extension is loaded. iconv-lite gets pulled in transitively just by
// `import express from 'express'` (express re-exports body-parser's json/
// urlencoded parsers via a getter that eagerly requires iconv-lite), so this
// happens regardless of whether the app calls express.json() itself.
//
// Aspire's API only ever sends and receives UTF-8 JSON, so full multi-charset
// conversion support isn't needed. This stub implements just enough of
// iconv-lite's API for body-parser/raw-body to load and run safely — it does
// not do any real charset transcoding for non-UTF-8 encodings.

function decode(buffer, encoding) {
  return Buffer.isBuffer(buffer) ? buffer.toString('utf8') : String(buffer);
}

function encode(str, encoding) {
  return Buffer.from(String(str), 'utf8');
}

function encodingExists(encoding) {
  const normalized = String(encoding || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return normalized === 'utf8' || normalized === 'ascii' || normalized === '';
}

module.exports = {
  decode,
  encode,
  encodingExists,
  _isAspireStub: true,
};
