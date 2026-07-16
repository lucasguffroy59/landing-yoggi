#!/usr/bin/env node
// Injects reciprocal hreflang + self-canonical tags into every page listed in
// scripts/i18n-manifest.json, between the `<!-- i18n:START -->` / `<!-- i18n:END -->`
// markers already present in each file's <head>. Run after adding a new
// language or a new page to the manifest: `node scripts/build-hreflang.mjs`.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const MANIFEST_PATH = path.join(ROOT, 'scripts', 'i18n-manifest.json');
const START = '<!-- i18n:START (managed by scripts/build-hreflang.mjs — do not edit inside markers) -->';
const END = '<!-- i18n:END -->';

function urlToFilePath(url) {
  const clean = url.endsWith('/') ? `${url}index.html` : url;
  return path.join(ROOT, clean.replace(/^\//, ''));
}

function buildBlock(domain, xDefault, variants, currentLang) {
  const lines = [START];
  lines.push(`  <link rel="canonical" href="${domain}${variants[currentLang]}">`);
  for (const [lang, url] of Object.entries(variants)) {
    lines.push(`  <link rel="alternate" hreflang="${lang}" href="${domain}${url}">`);
  }
  if (variants[xDefault]) {
    lines.push(`  <link rel="alternate" hreflang="x-default" href="${domain}${variants[xDefault]}">`);
  }
  lines.push(`  ${END}`);
  return lines.join('\n');
}

function main() {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const { domain, xDefault, pages } = manifest;
  let filesUpdated = 0;

  for (const [pageKey, variants] of Object.entries(pages)) {
    for (const currentLang of Object.keys(variants)) {
      const filePath = urlToFilePath(variants[currentLang]);
      let html;
      try {
        html = readFileSync(filePath, 'utf8');
      } catch {
        console.warn(`[skip] ${pageKey}/${currentLang}: file not found at ${filePath}`);
        continue;
      }

      const startIdx = html.indexOf(START);
      const endIdx = html.indexOf(END);
      if (startIdx === -1 || endIdx === -1) {
        console.warn(`[skip] ${pageKey}/${currentLang}: no i18n markers found in ${filePath}`);
        continue;
      }

      const block = buildBlock(domain, xDefault, variants, currentLang);
      const updated = html.slice(0, startIdx) + block + html.slice(endIdx + END.length);
      if (updated !== html) {
        writeFileSync(filePath, updated, 'utf8');
        filesUpdated++;
        console.log(`[ok] ${pageKey}/${currentLang} -> ${path.relative(ROOT, filePath)}`);
      }
    }
  }

  console.log(`\nDone. ${filesUpdated} file(s) updated.`);
}

main();
