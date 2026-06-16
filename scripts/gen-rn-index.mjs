#!/usr/bin/env node
// Generates docs/rn-call-site-index.md — a precomputed map of every
// API_ENDPOINTS.<GROUP>.<KEY> constant in the frozen RN app to its path
// template + the exact call sites (file:line) that reference it.
//
// Why: the legacy RN app at website-bonyad/ is .gitignore'd and FROZEN, so this
// map never goes stale. Reading it (one small doc) + opening the one mapped
// file:line range replaces a blind repo-wide grep + whole-file reads every time
// the web app needs to mirror an endpoint. See CLAUDE.md hard rule 2.
//
// Run locally where the frozen reference exists:  node scripts/gen-rn-index.mjs
// (The committed docs/rn-call-site-index.md is what gets consumed — the folder
//  itself is only needed to REgenerate.)

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RN_SRC = 'website-bonyad/src';
const API_FILE = resolve(ROOT, RN_SRC, 'config/api.ts');
const OUT = resolve(ROOT, 'docs/rn-call-site-index.md');
const MAX_SITES = 5; // cap call sites shown per endpoint (services ranked first)

if (!existsSync(API_FILE)) {
  console.error(`✗ ${RN_SRC}/config/api.ts not found.`);
  console.error('  The frozen RN reference folder must exist locally to regenerate.');
  process.exit(1);
}

/** Pull the path template out of a leaf RHS (string literal or arrow fn). */
function prettyPath(raw) {
  const v = raw.replace(/,\s*$/, '').trim();
  const lit = v.match(/^['"`]([^'"`]*)['"`]$/);
  if (lit) return lit[1];
  const arrow = v.match(/=>\s*`([^`]*)`/) || v.match(/=>\s*['"]([^'"]*)['"]/);
  if (arrow) return arrow[1] + (v.includes('(') ? '' : '');
  return v;
}

/** Parse api.ts → ordered [{ group, key, path }]. */
function parseEndpoints() {
  const lines = readFileSync(API_FILE, 'utf8').split('\n');
  const start = lines.findIndex((l) => /export const API_ENDPOINTS\s*=\s*\{/.test(l));
  const out = [];
  let group = null;
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^\};/.test(line)) break; // end of the object
    const g = line.match(/^ {2}([A-Z0-9_]+):\s*\{/);
    if (g) {
      group = g[1];
      continue;
    }
    if (/^ {2}\}/.test(line)) {
      group = null;
      continue;
    }
    if (!group) continue;
    const leaf = line.match(/^ {4}([A-Za-z0-9_]+):\s*(.+)$/);
    if (leaf) out.push({ group, key: leaf[1], path: prettyPath(leaf[2]) });
  }
  return out;
}

/** One grep over the RN app → Map<"GROUP.KEY", [{ file, line }]>. */
function collectUsages() {
  const cmd =
    `grep -rnoE "API_ENDPOINTS\\.[A-Z0-9_]+\\.[A-Za-z0-9_]+" ${RN_SRC} ` +
    `--include=*.ts --include=*.tsx`;
  let raw = '';
  try {
    raw = execSync(cmd, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  } catch (e) {
    raw = e.stdout || '';
  } // grep exits 1 on no match
  const map = new Map();
  for (const ln of raw.split('\n')) {
    const m = ln.match(/^(.+?):(\d+):API_ENDPOINTS\.([A-Z0-9_]+)\.([A-Za-z0-9_]+)$/);
    if (!m) continue;
    const [, file, line, group, key] = m;
    if (file.endsWith('config/api.ts')) continue; // the definition file itself
    const id = `${group}.${key}`;
    if (!map.has(id)) map.set(id, []);
    map.get(id).push({ file, line: Number(line) });
  }
  return map;
}

/** Rank: services/ first (request bodies + response field reads live there). */
function rankSite(s) {
  if (s.file.includes('/services/')) return 0;
  if (/\/hooks\//.test(s.file)) return 1;
  if (s.file.includes('/screens/')) return 2;
  return 3;
}

/** Collapse multiple hits in one file → "file:line1,line2", services first. */
function formatSites(sites) {
  if (!sites || sites.length === 0) return '_(defined, no RN usage)_';
  const byFile = new Map();
  for (const s of sites) {
    if (!byFile.has(s.file)) byFile.set(s.file, { file: s.file, lines: [] });
    byFile.get(s.file).lines.push(s.line);
  }
  const entries = [...byFile.values()].sort((a, b) => rankSite(a) - rankSite(b));
  const shown = entries.slice(0, MAX_SITES).map((e) => {
    const lines = [...new Set(e.lines)].sort((a, b) => a - b).join(',');
    return `\`${e.file}:${lines}\``;
  });
  const extra = entries.length - shown.length;
  return (
    shown.join('<br>') + (extra > 0 ? `<br>_(+${extra} more file${extra > 1 ? 's' : ''})_` : '')
  );
}

function structureMap() {
  const dirs = execSync(`find ${RN_SRC} -maxdepth 1 -type d`, { cwd: ROOT, encoding: 'utf8' })
    .split('\n')
    .filter(Boolean)
    .map((d) => d.replace(`${RN_SRC}/`, ''))
    .filter((d) => d !== RN_SRC)
    .sort();
  const screens = execSync(`find ${RN_SRC}/screens -maxdepth 1 -type d`, {
    cwd: ROOT,
    encoding: 'utf8',
  })
    .split('\n')
    .filter(Boolean)
    .map((d) => d.split('/').pop())
    .filter((d) => d !== 'screens')
    .sort();
  return { dirs, screens };
}

function render(endpoints, usages) {
  const { dirs, screens } = structureMap();
  const groups = [...new Set(endpoints.map((e) => e.group))];
  const withSite = endpoints.filter((e) => usages.has(`${e.group}.${e.key}`)).length;
  const L = [];
  L.push(
    '<!-- GENERATED by scripts/gen-rn-index.mjs — do not hand-edit. Run `node scripts/gen-rn-index.mjs` to refresh. -->',
  );
  L.push('');
  L.push('# RN call-site index — endpoint → exact file:line (token-saving map)');
  L.push('');
  L.push("The legacy RN app at `website-bonyad/` is **frozen and `.gitignore`'d**, so this");
  L.push('precomputed map never goes stale. It exists so you **never grep `website-bonyad/`');
  L.push('blind and never read a whole screen file** to mirror an endpoint.');
  L.push('');
  L.push('## How to use this (binding — see CLAUDE.md hard rule 2)');
  L.push('');
  L.push(
    '1. Find your endpoint constant in the tables below → note the **path** and the **call site(s)**.',
  );
  L.push(
    '2. `Read` **only that file at that line range** (`offset`/`limit` ≈ ±15 lines) to copy the',
  );
  L.push(
    '   request-body field names and the `data.x ?? data.y` response reads. Do **not** read the whole file.',
  );
  L.push(
    '3. Call sites are ranked **`services/` first** — that is where the request body is built and the',
  );
  L.push(
    '   response fields are read. `screens/` / `hooks/` rows show where the user flow triggers it.',
  );
  L.push(
    '4. If an endpoint is **not** in this index, then (and only then) fall back to grep — and add the',
  );
  L.push('   result here. An endpoint marked _(defined, no RN usage)_ has no call site to mirror.');
  L.push('');
  L.push(
    `> Coverage: **${endpoints.length}** endpoint constants across **${groups.length}** groups · `,
  );
  L.push(
    `> **${withSite}** with a mapped call site · **${endpoints.length - withSite}** defined-but-unused.`,
  );
  L.push('');
  L.push('## `website-bonyad/src/` structure map');
  L.push('');
  L.push(`- **Top level:** ${dirs.map((d) => `\`${d}/\``).join(' · ')}`);
  L.push(`- **\`screens/\` sections:** ${screens.map((d) => `\`${d}/\``).join(' · ')}`);
  L.push(
    '- **Definitions:** `website-bonyad/src/config/api.ts` (the `API_ENDPOINTS` constant — mirror into `src/config/endpoints.ts`).',
  );
  L.push(
    '- **Field names live in:** `website-bonyad/src/services/` (fetch wrappers) — the ranked-first call sites below.',
  );
  L.push('');
  L.push('## Endpoints by group');
  L.push('');
  for (const group of groups) {
    L.push(`### ${group}`);
    L.push('');
    L.push('| Constant | Path | Call sites (`services/` first) |');
    L.push('| --- | --- | --- |');
    for (const e of endpoints.filter((x) => x.group === group)) {
      const sites = formatSites(usages.get(`${e.group}.${e.key}`));
      L.push(`| \`${e.group}.${e.key}\` | \`${e.path}\` | ${sites} |`);
    }
    L.push('');
  }
  return L.join('\n');
}

const endpoints = parseEndpoints();
const usages = collectUsages();
writeFileSync(OUT, render(endpoints, usages));
const withSite = endpoints.filter((e) => usages.has(`${e.group}.${e.key}`)).length;
console.log(`✓ ${OUT}`);
console.log(
  `  ${endpoints.length} endpoints · ${withSite} mapped · ${endpoints.length - withSite} unused`,
);
