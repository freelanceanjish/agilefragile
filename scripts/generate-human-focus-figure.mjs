#!/usr/bin/env node
/**
 * Build research-paper exports for Figure HF-1 (human focus foundations diagram).
 * Outputs PDF and PNG under downloads/. Requires Google Chrome/Chromium.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync, statSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svgPath = join(root, 'assets/human-focus-foundations-diagram-print.svg');
const svgCopyPath = join(root, 'downloads/human-focus-foundations-figure.svg');
const htmlPath = join(root, 'downloads/.human-focus-figure-print.html');
const pdfPath = join(root, 'downloads/human-focus-foundations-figure.pdf');
const pngPath = join(root, 'downloads/human-focus-foundations-figure.png');

const svg = readFileSync(svgPath, 'utf8');
copyFileSync(svgPath, svgCopyPath);

const svgDataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Figure HF-1 · Human focus foundations</title>
  <style>
    @page { size: A4 landscape; margin: 14mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Inter", system-ui, sans-serif;
      color: #151517;
      background: #fff;
    }
    .sheet {
      max-width: 960px;
      margin: 0 auto;
      padding: 8mm 0 0;
    }
    figure { margin: 0; }
    figure img {
      width: 100%;
      height: auto;
      display: block;
      border: 1px solid #d8d8de;
      border-radius: 12px;
    }
    figcaption {
      margin-top: 10px;
      font-size: 10pt;
      line-height: 1.5;
      color: #444;
    }
    figcaption strong { color: #151517; }
    .rights {
      margin-top: 8px;
      font-size: 8.5pt;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="sheet">
    <figure>
      <img src="${svgDataUri}" alt="Figure HF-1. Two foundations, one human focus.">
      <figcaption>
        <strong>Figure HF-1.</strong> Human focus from two foundations. The Agile Manifesto (2001) and responsible AI principles privacy professionals track through IAPP converge on human oversight at the human gate before Adapt, Implement, or Scale run in the transformation tabernacle.
      </figcaption>
      <p class="rights">Copyright © 2026 Anjish Bhondwe. All rights reserved. Human Agile™, Human Agile Index™, Human Agile Model™, and Agile Fragile™ are trademarks of Anjish Bhondwe. Research use with attribution is invited. Commercial reproduction requires written permission from hello@agilefragile.com. Required attribution: &ldquo;Human Agile Model&rdquo; by Anjish Bhondwe, agilefragile.com.</p>
    </figure>
  </div>
</body>
</html>`;

writeFileSync(htmlPath, html);

const chromeCandidates = [
  process.env.CHROME_PATH,
  'google-chrome',
  'google-chrome-stable',
  'chromium',
  'chromium-browser'
].filter(Boolean);

function runChrome(chrome, args) {
  return spawnSync(chrome, args, { encoding: 'utf8' });
}

let pdfOk = false;
let pngOk = false;
let lastError = '';

for (const chrome of chromeCandidates) {
  const pdfResult = runChrome(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--no-pdf-header-footer',
    `--print-to-pdf=${pdfPath}`,
    htmlPath
  ]);

  if (pdfResult.status === 0) {
    try {
      if (statSync(pdfPath).size > 3000) {
        pdfOk = true;
      } else {
        lastError = `${chrome}: PDF too small`;
      }
    } catch {
      lastError = `${chrome}: PDF not written`;
    }
  } else {
    lastError = `${chrome}: ${pdfResult.stderr || pdfResult.stdout || 'pdf exit ' + pdfResult.status}`;
  }

  const pngResult = runChrome(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--hide-scrollbars',
    '--window-size=1024,780',
    `--screenshot=${pngPath}`,
    htmlPath
  ]);

  if (pngResult.status === 0) {
    try {
      if (statSync(pngPath).size > 5000) {
        pngOk = true;
        break;
      }
      lastError = `${chrome}: PNG too small`;
    } catch {
      lastError = `${chrome}: PNG not written`;
    }
  } else if (!lastError) {
    lastError = `${chrome}: ${pngResult.stderr || pngResult.stdout || 'png exit ' + pngResult.status}`;
  }
}

try {
  unlinkSync(htmlPath);
} catch {
  /* temp file may already be gone */
}

if (!pdfOk || !pngOk) {
  console.error('Failed to generate human focus figure exports.');
  console.error(lastError);
  process.exit(1);
}

console.log(`Wrote ${svgCopyPath}`);
console.log(`Wrote ${pdfPath} (${statSync(pdfPath).size} bytes)`);
console.log(`Wrote ${pngPath} (${statSync(pngPath).size} bytes)`);
