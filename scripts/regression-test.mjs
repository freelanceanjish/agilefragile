#!/usr/bin/env node
/**
 * Agile Fragile static site regression checks.
 * Run: node scripts/regression-test.mjs
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const root = new URL('..', import.meta.url).pathname;
const errors = [];
const warnings = [];

function read(path) {
  return readFileSync(join(root, path), 'utf8');
}

function walkHtml(dir, files = []) {
  for (const name of readdirSync(join(root, dir))) {
    const p = join(dir, name);
    const full = join(root, p);
    if (statSync(full).isDirectory()) {
      if (!name.startsWith('.') && name !== 'node_modules' && name !== 'downloads') walkHtml(p, files);
    } else if (extname(name) === '.html') files.push(p);
  }
  return files;
}

const htmlFiles = walkHtml('.');
const css = read('assets/site.css');
const index = read('index.html');
const howWeWork = read('how-we-work.html');
const leaders = read('leaders.html');
const indexJs = read('assets/index.js');

// --- Branding ---
if (!/<h1[^>]*>[\s\S]*?Agile[\s\S]*?Fragile/i.test(index)) {
  errors.push('Home hero h1 must contain "Agile Fragile"');
}
if (!/class="nav-logo">Agile\s*<span>Fragile<\/span></.test(index)) {
  errors.push('Nav logo must use Agile <span>Fragile</span> like anjishbhondwe.com');
}
if (/>\s*AF\s*</.test(index)) {
  errors.push('Home page must not show standalone "AF"');
}
const favicon = read('assets/favicon.svg');
if (/>\s*AF\s*</i.test(favicon)) {
  errors.push('Favicon must not use "AF" abbreviation');
}

for (const file of ['assets/favicon.svg', 'assets/logo.svg', 'assets/logo-mark.svg']) {
  try {
    const svg = read(file);
    if (/>\s*AF\s*</i.test(svg)) warnings.push(`${file} still contains "AF" text`);
  } catch {
    /* optional file */
  }
}

// --- Typography / layout CSS ---
if (/text-wrap:\s*balance/i.test(css)) errors.push('CSS must not use text-wrap: balance');
if (/max-width:\s*\d+ch/i.test(css)) errors.push('CSS must not use max-width in ch units on headings');

// --- Solo proposer tone (home) ---
if (/global enterprises|6\+\s*<\/p>\s*<p class="label">Global/i.test(index)) {
  errors.push('Home must not claim "6+ global enterprises" as firm proof');
}
if (/hero-stats/.test(index)) {
  errors.push('Home hero must not include stats strip (credibility lives on anjishbhondwe.com)');
}
if (/case-outcome|case-grid/.test(index)) {
  errors.push('Home must not include fake case-study outcome cards');
}

// --- Repetition on home ---
const homeSections = (index.match(/<section/g) || []).length;
if (homeSections > 6) {
  warnings.push(`Home has ${homeSections} sections; keep ≤6 for a focused landing page`);
}

// --- Irregular legacy colors ---
if (/#818181|gray-mammoth|--accent:\s*#1f35a9/i.test(css)) {
  errors.push('CSS must not use legacy gray mammoth / old accent palette');
}
if (/background:\s*#fff|background:\s*var\(--white\)/i.test(css) && /voice-card|case-card/.test(css)) {
  warnings.push('Cards should use dark surface tokens, not white backgrounds');
}

// --- Proposal page ---
if (!/The proposal/i.test(howWeWork)) {
  errors.push('how-we-work.html hero must say "The proposal"');
}
if (/How we work/i.test(howWeWork)) {
  errors.push('how-we-work.html must not use "How we work" consultancy framing');
}

// --- Leaders page ---
if (/hero-proof/.test(leaders)) {
  errors.push('leaders.html must not use hero-proof stats strip');
}
if (/Who you will work with/i.test(leaders)) {
  errors.push('leaders.html must not say "Who you will work with"');
}

// --- Consultancy tone sitewide ---
const bannedPatterns = [
  { re: /Work with us/i, label: 'Work with us' },
  { re: /Who you will work with/i, label: 'Who you will work with' },
  { re: /We help leadership/i, label: 'We help leadership' },
  { re: /We work with organizations/i, label: 'We work with organizations' },
  { re: /Engagement flow/i, label: 'Engagement flow' },
  { re: /footer-label[^>]*>Organizations</i, label: 'Organizations footer column' },
];
for (const file of htmlFiles) {
  const html = read(file);
  for (const { re, label } of bannedPatterns) {
    if (re.test(html)) {
      errors.push(`${file}: consultancy tone detected (${label})`);
    }
  }
}

// --- Every page: fonts, nav ---
for (const file of htmlFiles) {
  const html = read(file);
  if (/fonts\.googleapis\.com.*Inter/i.test(html)) {
    errors.push(`${file}: remove Inter/Newsreader font links; use site.css IBM Plex import only`);
  }
  if (!/class="nav-logo"/.test(html)) {
    errors.push(`${file}: missing nav-logo`);
  }
}

// --- Index quiz ---
if (/question-text t-h-5/.test(index)) {
  warnings.push('Index questions use t-h-5; prefer body text size in quiz');
}
if (/How we work with organizations/i.test(indexJs)) {
  errors.push('assets/index.js must not use consultancy CTA copy');
}

console.log('Agile Fragile regression test\n');
if (warnings.length) {
  console.log('Warnings:');
  warnings.forEach((w) => console.log('  ⚠', w));
  console.log('');
}
if (errors.length) {
  console.log('Failures:');
  errors.forEach((e) => console.log('  ✗', e));
  process.exit(1);
}
console.log(`✓ ${htmlFiles.length} HTML files checked`);
console.log('✓ All regression checks passed');
