import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';

const dist = resolve(import.meta.dirname, '../apps/client/dist');
const html = readFileSync(resolve(dist, 'index.html'), 'utf8');
const entries = [...html.matchAll(/<script\b[^>]*type="module"[^>]*src="([^"]+)"/g)]
  .map(match => match[1]);
assert.equal(entries.length, 1, 'HTML must load exactly one app entry');
assert.match(entries[0], /^\/assets\/app-[\w-]+\.js$/, 'Entry must be content-hashed, not query-versioned');
const entry = resolve(dist, entries[0].slice(1));
assert.ok(existsSync(entry), 'HTML entry must exist');
const assets = resolve(dist, 'assets');
const modules = readdirSync(assets).filter(name => name.endsWith('.js'));
let imports = 0;
let entryReferences = 0;
for (const name of modules) {
  const file = resolve(assets, name);
  const code = readFileSync(file, 'utf8');
  for (const match of code.matchAll(/(?:from\s*|import\s*\(\s*|import\s*)["'](\.\/[^"']+\.js(?:\?[^"']*)?)["']/g)) {
    imports++;
    assert.ok(!match[1].includes('?'), `${name}: query creates a second module identity`);
    assert.ok(existsSync(resolve(dirname(file), match[1])), `${name}: missing ${match[1]}`);
    if (basename(match[1]).startsWith('app')) {
      assert.equal(resolve(dirname(file), match[1]), entry, `${name}: imports a different app instance`);
      entryReferences++;
    }
  }
  assert.ok(!/["']\.\/app\.js(?:\?|["'])/.test(code), `${name}: obsolete unversioned entry`);
}
assert.ok(entryReferences > 0, 'Regression check must exercise lazy-chunk back-imports');
console.log(JSON.stringify({
  ok: true, entry: entries[0], modules: modules.length,
  importReferences: imports, sharedEntryReferences: entryReferences,
  entryBytes: readFileSync(entry).byteLength,
}));
