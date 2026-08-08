// npm's "overrides" + "file:" protocol is supposed to make every
// require('iconv-lite') resolve to our tiny UTF-8-only stub (see
// vendor/iconv-lite-stub) instead of the real package, which crashes
// Cloudflare Workers' bundler. In practice npm creates a *symlink* for each
// place iconv-lite is required (top-level node_modules/, and again inside
// raw-body's own nested node_modules/), and computes the symlink's relative
// path using the wrong base directory for nested copies — e.g.
// node_modules/raw-body/node_modules/iconv-lite ends up pointing at
// node_modules/raw-body/vendor/iconv-lite-stub, which doesn't exist. The
// result is a broken symlink and `Cannot find module 'iconv-lite'` at
// startup, in Node and in `wrangler dev` alike.
//
// This script runs after every `npm install` and replaces every iconv-lite
// symlink (broken or not) with a real copy of the stub's files, so
// resolution can't depend on relative symlink math at all.
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const stubDir = path.join(root, 'vendor', 'iconv-lite-stub');

function findIconvLiteDirs(dir, found = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }

  for (const entry of entries) {
    if (entry.name === '.bin') continue;
    const full = path.join(dir, entry.name);

    if (entry.name === 'iconv-lite' && (entry.isDirectory() || entry.isSymbolicLink())) {
      found.push(full);
      continue;
    }

    if (entry.name === 'node_modules' || (entry.isDirectory() && dir.endsWith('node_modules'))) {
      if (entry.isDirectory()) findIconvLiteDirs(full, found);
    }
  }

  return found;
}

function copyStub(target) {
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });
  for (const file of fs.readdirSync(stubDir)) {
    fs.copyFileSync(path.join(stubDir, file), path.join(target, file));
  }
}

const nodeModules = path.join(root, 'node_modules');
if (!fs.existsSync(stubDir)) {
  console.warn('fix-iconv-stub: vendor stub not found at', stubDir, '- skipping');
  process.exit(0);
}

const targets = findIconvLiteDirs(nodeModules);
for (const target of targets) {
  copyStub(target);
  console.log('fix-iconv-stub: replaced', path.relative(root, target), 'with real stub files');
}

if (targets.length === 0) {
  console.log('fix-iconv-stub: no iconv-lite install found (nothing to do)');
}
