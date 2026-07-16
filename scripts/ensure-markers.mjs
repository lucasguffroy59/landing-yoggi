#!/usr/bin/env node
// One-off helper: ensures every page listed in the manifest has the i18n
// START/END markers around its <link rel="canonical"> line. Idempotent — files
// that already contain the markers are left untouched. Run once before
// build-hreflang.mjs when adding pages that only have a plain canonical tag.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const MANIFEST_PATH = path.join(ROOT, 'scripts', 'i18n-manifest.json');
const START = '<!-- i18n:START (managed by scripts/build-hreflang.mjs — do not edit inside markers) -->';
const END = '<!-- i18n:END -->';
const CANONICAL_RE = /^([ \t]*)<link rel="canonical"[^>]*>\s*$/m;

function urlToFilePath(url) {
  const clean = url.endsWith('/') ? `${url}index.html` : url;
  return path.join(ROOT, clean.replace(/^\//, ''));
}

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
let updated = 0;

for (const [pageKey, variants] of Object.entries(manifest.pages)) {
  for (const [lang, url] of Object.entries(variants)) {
    const filePath = urlToFilePath(url);
    let html;
    try { html = readFileSync(filePath, 'utf8'); }
    catch { console.warn(`[skip] ${pageKey}/${lang}: not found`); continue; }

    if (html.includes(START)) continue; // already has markers

    const m = html.match(CANONICAL_RE);
    if (!m) { console.warn(`[skip] ${pageKey}/${lang}: no canonical line to wrap`); continue; }

    const indent = m[1] ?? '  ';
    const wrapped = `${indent}${START}\n${m[0].trim()}\n${indent}${END}`;
    const next = html.replace(CANONICAL_RE, wrapped.replace(/\$/g, '$$$$'));
    writeFileSync(filePath, next, 'utf8');
    updated++;
    console.log(`[ok] wrapped ${pageKey}/${lang} -> ${path.relative(ROOT, filePath)}`);
  }
}

console.log(`\nDone. ${updated} file(s) wrapped.`);
