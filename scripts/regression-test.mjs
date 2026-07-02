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
const indexJs = read('assets/index.js');

// --- Branding ---
if (!/Agile\s+Fragile/i.test(index)) {
  errors.push('Home page must include Agile Fragile branding');
}
if (!/id="hero"/.test(index) || !/landing-hero/.test(index)) {
  errors.push('Home page must use landing hero section');
}
if (!/data-home-hero/.test(index)) {
  errors.push('Home hero must use scroll-driven data-home-hero');
}
if (!/wordmark-line/.test(index) || !/text-anchor="middle"/.test(index)) {
  errors.push('Home hero wordmark must be inline centered SVG with Fraunces');
}
const heroWordmark = read('assets/hero-wordmark.svg');
if (!/text-anchor="middle"/.test(heroWordmark)) {
  errors.push('hero-wordmark.svg must use centered text-anchor middle');
}
if (!/Fraunces/i.test(heroWordmark)) {
  errors.push('hero-wordmark.svg must use Fraunces serif wordmark');
}
if (!/logo-tagline--hero/.test(index) || !/So God created man in His own image/.test(index)) {
  errors.push('Home hero logo must include scripture tagline under wordmark');
}
if (!/\.landing-hero-wordmark \.wordmark-line[\s\S]*font-size:\s*150px/.test(css)) {
  errors.push('Hero wordmark must stay giant on desktop (150px Fraunces)');
}
if (!/\.landing-hero-wordmark \.wordmark-line[\s\S]*font-size:\s*185px/.test(css)) {
  errors.push('Hero wordmark must stay giant on mobile (185px Fraunces)');
}
if (!/home-hero\.js/.test(index)) {
  errors.push('Home page must load home-hero.js for scroll effects');
}
if (!/landing-hero-panel/.test(index)) {
  errors.push('Home hero must include fixed panel with mask wipe');
}
if (!/id="explore"/.test(index) || !/landing-cards/.test(index)) {
  errors.push('Home page must include explore cards section');
}
if (!/id="impact"/.test(index) || !/landing-stats/.test(index)) {
  errors.push('Home page must include impact stats section');
}
if (!/id="leadership"/.test(index)) {
  errors.push('Home page must include leadership section');
}
if (/>\s*AF\s*</.test(index)) {
  errors.push('Home page must not show standalone "AF"');
}
if (!/logo-wordmark\.svg/.test(index) && !/wordmark-svg logo-wordmark/.test(index)) {
  errors.push('Home header must use logo wordmark');
}
const wordmark = read('assets/logo-wordmark.svg');
if (!/>AGILE<\/text>/.test(wordmark) || !/>FRAGILE<\/text>/.test(wordmark)) {
  errors.push('Header wordmark must be all-caps white stacked Fraunces wordmark');
}
if (!/text-anchor="middle"/.test(wordmark)) {
  errors.push('Wordmark SVG files must center AGILE/FRAGILE with text-anchor middle');
}
if (!/Fraunces/i.test(wordmark)) {
  errors.push('Header wordmark must use Fraunces serif');
}
if (!/font-serif/.test(css) || !/\.wordmark-line[\s\S]*font-family:\s*var\(--font-serif\)/.test(css)) {
  errors.push('CSS .wordmark-line must use Fraunces via --font-serif');
}
if (!/logo-lockup/.test(wordmark) && !/logo-lockup/.test(read('about.html'))) {
  errors.push('Header logo must use logo-lockup with tagline');
}
if (!/So God created man in His own image/.test(read('about.html'))) {
  errors.push('Header logo must include scripture tagline');
}
if (/fill="#1f35a9">Fragile/.test(wordmark)) {
  errors.push('Header wordmark must not use two-tone blue; use all-white wordmark');
}
if (/class="nav-logo"/.test(index)) {
  errors.push('Do not use portfolio-style nav-logo text; use logo wordmark image');
}

// --- Agile Fragile design system ---
if (!/--page-gray:\s*#818181/.test(css)) {
  errors.push('CSS must use page gray background token (--page-gray: #818181)');
}
if (!/--text-secondary:/.test(css)) {
  errors.push('CSS must define readable secondary text token for gray page background');
}
if (!/--gray-medium:\s*#c8c8c8/.test(css)) {
  errors.push('CSS must include gray-medium token (#c8c8c8)');
}
if (/IBM Plex Sans|@import.*IBM\+Plex/i.test(css)) {
  errors.push('CSS must not use IBM Plex portfolio fonts; use Fraunces + DM Sans via HTML link');
}
if (/background:\s*var\(--bg\)|--bg:\s*#161616/.test(css) && !/--page-gray/.test(css)) {
  errors.push('CSS must not use Carbon #161616 as primary page background');
}
for (const file of htmlFiles) {
  const html = read(file);
  if (!/Fraunces/i.test(html) || !/DM\+Sans|DM Sans/i.test(html)) {
    errors.push(`${file}: missing Fraunces/DM Sans font links`);
  }
  if (!/class="logo"/.test(html)) {
    errors.push(`${file}: header must use .logo wordmark`);
  }
}

// --- No portfolio layout clone on home ---
if (/anjishbhondwe\.com\/profile\.jpg/.test(index)) {
  errors.push('Home must not hotlink portfolio profile photo');
}
if (/hero-img-wrap|hero-exec/.test(index)) {
  errors.push('Home must not use portfolio two-column hero layout');
}

// --- Solo proposer tone ---
if (/hero-stats|proof-stats|case-grid/.test(index)) {
  errors.push('Home must not include fake enterprise proof blocks');
}

const bannedPatterns = [
  { re: /Work with us/i, label: 'Work with us' },
  { re: /Who you will work with/i, label: 'Who you will work with' },
  { re: /We help leadership/i, label: 'We help leadership' },
  { re: /We work with organizations/i, label: 'We work with organizations' },
  { re: /Engagement flow/i, label: 'Engagement flow' },
];
for (const file of htmlFiles) {
  const html = read(file);
  for (const { re, label } of bannedPatterns) {
    if (re.test(html)) errors.push(`${file}: consultancy tone (${label})`);
  }
}

if (/How we work with organizations/i.test(indexJs)) {
  errors.push('assets/index.js must not use consultancy CTA copy');
}

if (/text-wrap:\s*balance/i.test(css)) {
  errors.push('CSS must not use text-wrap: balance');
}

// --- Case study interactivity ---
if (!/index-feedback/.test(index)) {
  errors.push('Home Index must include post-score feedback form');
}
if (!/index-share/.test(index)) {
  errors.push('Home Index must include shareable score link');
}
const model = read('model.html');
if (!/model-walk/.test(model)) {
  errors.push('Model page must include interactive pipeline walk');
}
if (!/id="model-definition"/.test(model)) {
  errors.push('Model page must define the model (model-definition section)');
}
if (!/id="human-gate"/.test(model)) {
  errors.push('Model page must include human gate section');
}
if (!/id="operating-rules"/.test(model)) {
  errors.push('Model page must include operating rules');
}
if (!/move-detail/.test(model)) {
  errors.push('Model page moves must include activities/outputs detail');
}
if (!/contrast-grid/.test(model)) {
  errors.push('Model page divide must use contrast-grid pattern');
}
if (!/id="agile-foundation"/.test(model)) {
  errors.push('Model page must include agile foundation section');
}
if (!/id="index-scoring"/.test(model)) {
  errors.push('Model page must explain Index scoring');
}
if (!/id="model-glossary"/.test(model)) {
  errors.push('Model page must include terminology glossary');
}
if (!/id="four-moves-spec"/.test(model)) {
  errors.push('Model page must include full four-moves specification');
}
if (!/id="model-copyright"/.test(model)) {
  errors.push('Model page must include copyright and attribution');
}
if (!/id="model-document"/.test(model)) {
  errors.push('Model page must be wrapped as specification document');
}
if (!/open-questions/.test(read('how-we-work.html'))) {
  errors.push('Proposal page must include open questions section');
}
if (!/case-study-banner/.test(read('assets/site.js'))) {
  errors.push('site.js must inject case study banner');
}
if (!/home-page/.test(read('assets/site.js')) || !/landing/.test(read('assets/site.js'))) {
  errors.push('site.js must skip case study banner on home/landing pages');
}
if (!/insertAdjacentElement\('afterend'/.test(read('assets/site.js'))) {
  errors.push('site.js must place case study banner after hero section, not under header');
}
if (!/--logo-height:/.test(css) || !/--site-header-clearance: calc/.test(css)) {
  errors.push('CSS must calculate header clearance from logo height');
}
if (!/body\.home-page \.case-study-banner/.test(css)) {
  errors.push('CSS must hide case study banner on home page');
}
if (!/body\.home-page \.site-header/.test(css) || !/opacity:\s*0/.test(css)) {
  errors.push('CSS must hide fixed header on home during hero scroll');
}
if (!/home-header-visible/.test(read('assets/home-hero.js'))) {
  errors.push('home-hero.js must reveal header after hero scroll progress');
}
if (!/headerVisible/.test(read('assets/home-hero.js'))) {
  errors.push('home-hero.js must control header visibility during hero scroll');
}
if (!/scrollingUp/.test(read('assets/home-hero.js'))) {
  errors.push('home-hero.js must hide header when scrolling up');
}
if (!/isScrolling/.test(read('assets/home-hero.js'))) {
  errors.push('home-hero.js must restore header when scrolling stops');
}
if (!/scrollDirection/.test(read('assets/home-hero.js'))) {
  errors.push('home-hero.js must track scroll direction for header hide on scroll up');
}
if (!/panelRevealStart/.test(read('assets/home-hero.js'))) {
  errors.push('home-hero.js must delay panel reveal until after hero scroll starts');
}
if (!/layoutVh/.test(read('assets/home-hero.js'))) {
  errors.push('home-hero.js must lock layout viewport height to prevent mobile address-bar flicker');
}
if (!/height:\s*0/.test(css) || !/\.landing-hero-panel/.test(css)) {
  errors.push('CSS must start hero panel hidden (height 0) until scroll reveals it');
}
if (!/The drift/.test(index) || !/landing-hero-slide--drift/.test(index)) {
  errors.push('Home hero first slide must label the drift');
}
if (!/Product first/.test(index) || !/People later/.test(index)) {
  errors.push('Home hero drift slide must keep Product first / People later headline');
}
if (!/We forgot the order/.test(index)) {
  errors.push('Home hero drift slide must keep We forgot the order closing line');
}
if (!/panelFullHeight/.test(read('assets/home-hero.js'))) {
  errors.push('home-hero.js must define panelFullHeight for readable hero slide panel');
}
if (!/slideRangeStart/.test(read('assets/home-hero.js'))) {
  errors.push('home-hero.js must delay slides until hero panel reaches full height');
}
const homeHeroJs = read('assets/home-hero.js');
if (!/layoutVh \* 0\.5[4-9]/.test(homeHeroJs) && !/layoutVh \* 0\.5/.test(homeHeroJs)) {
  errors.push('home-hero.js mobile panel must use at least 50% viewport height');
}
if (!/overflow-y:\s*auto/.test(css) || !/landing-hero-slide/.test(css)) {
  errors.push('CSS must allow hero slides to scroll when panel content exceeds height');
}
if (!/max-width:\s*599px/.test(css) || !/\.landing-hero-panel[\s\S]*position:\s*fixed/.test(css)) {
  errors.push('CSS must use fixed bottom hero panel on mobile so blue slides stay visible');
}
if (!/190svh/.test(css) || !/landing-hero-pin/.test(css)) {
  errors.push('CSS must give mobile hero enough scroll height for slide panel');
}
if (/case-study-banner__label">Case study <span>v0\./.test(read('assets/site.js'))) {
  errors.push('site.js case study banner must not include version numbers');
}
if (!/--logo-width:\s*168px/.test(css)) {
  errors.push('CSS must define readable header logo width (--logo-width >= 168px)');
}
if (!/--site-header-clearance/.test(css)) {
  errors.push('CSS must define --site-header-clearance to prevent header overlap');
}
if (!/z-index:\s*200/.test(css) || !/\.site-header/.test(css)) {
  errors.push('Site header must sit above page content (z-index 200)');
}
if (!/viewBox="350 20 700 330"/.test(read('about.html'))) {
  errors.push('Header wordmark must use cropped viewBox for readable logo size');
}
if (/v0\.[0-9]/.test(read('model.html'))) {
  errors.push('Model page must not display version numbers');
}
const specMd = 'downloads/human-agile-model-specification.md';
try {
  const spec = read(specMd);
  if (!/Copyright © 2026 Anjish Bhondwe/.test(spec)) {
    errors.push('Downloadable model specification must include copyright notice');
  }
  if (!/Human gate/.test(spec)) {
    errors.push('Downloadable model specification must document human gate');
  }
} catch {
  errors.push('downloads/human-agile-model-specification.md must exist');
}

// --- Copy style: no em dashes (U+2014) in public site copy ---
const emDash = /\u2014/;
const copyFiles = [...htmlFiles, specMd];
for (const file of copyFiles) {
  if (emDash.test(read(file))) {
    errors.push(`${file}: must not contain em dashes (use commas, colons, or periods instead)`);
  }
}

const attributionGuardFiles = ['assets/site.css', 'scripts/apply-site-shell.py', ...htmlFiles];
const forbiddenRef = /mammothbrands|mammoth-brand|gray-mammoth|text-on-mammoth/i;
for (const file of attributionGuardFiles) {
  if (forbiddenRef.test(read(file))) {
    errors.push(`${file}: must not reference third-party design sources in code`);
  }
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
