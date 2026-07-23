#!/usr/bin/env node
/**
 * Build downloads/human-agile-model-specification.pdf from the Markdown source.
 * Watermarked with the Agile Fragile logo. Requires Google Chrome/Chromium.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mdPath = join(root, 'downloads/human-agile-model-specification.md');
const htmlPath = join(root, 'downloads/.spec-print.html');
const pdfPath = join(root, 'downloads/human-agile-model-specification.pdf');
const logoPath = join(root, 'assets/logo/square-stacked-black.svg');

function inlineMd(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function isTableRow(line) {
  return /^\|.+\|$/.test(line.trim());
}

function parseTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => inlineMd(cell.trim()));
}

function mdToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      out.push('<hr>');
      i += 1;
      continue;
    }

    if (trimmed.startsWith('```')) {
      const codeLines = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1;
      out.push(`<pre>${codeLines.join('\n').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`);
      continue;
    }

    if (isTableRow(trimmed)) {
      const rows = [];
      while (i < lines.length && isTableRow(lines[i].trim())) {
        rows.push(parseTableRow(lines[i]));
        i += 1;
      }
      if (rows.length >= 2 && rows[1].every((cell) => /^:?-+:?$/.test(cell))) {
        rows.splice(1, 1);
      }
      const [head, ...body] = rows;
      out.push('<table><thead><tr>' + head.map((c) => `<th>${c}</th>`).join('') + '</tr></thead><tbody>');
      for (const row of body) {
        out.push('<tr>' + row.map((c) => `<td>${c}</td>`).join('') + '</tr>');
      }
      out.push('</tbody></table>');
      continue;
    }

    if (/^#### /.test(trimmed)) {
      out.push(`<h4>${inlineMd(trimmed.slice(5))}</h4>`);
      i += 1;
      continue;
    }
    if (/^### /.test(trimmed)) {
      out.push(`<h3>${inlineMd(trimmed.slice(4))}</h3>`);
      i += 1;
      continue;
    }
    if (/^## /.test(trimmed)) {
      out.push(`<h2>${inlineMd(trimmed.slice(3))}</h2>`);
      i += 1;
      continue;
    }
    if (/^# /.test(trimmed)) {
      out.push(`<h1>${inlineMd(trimmed.slice(2))}</h1>`);
      i += 1;
      continue;
    }

    if (/^[-*] /.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i].trim())) {
        items.push(`<li>${inlineMd(lines[i].trim().slice(2))}</li>`);
        i += 1;
      }
      out.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    if (/^\d+\. /.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) {
        items.push(`<li>${inlineMd(lines[i].trim().replace(/^\d+\.\s*/, ''))}</li>`);
        i += 1;
      }
      out.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    const para = [trimmed];
    i += 1;
    while (i < lines.length && lines[i].trim() && !/^#/.test(lines[i].trim()) && !/^[-*] /.test(lines[i].trim()) && !/^\d+\. /.test(lines[i].trim()) && !isTableRow(lines[i].trim()) && !lines[i].trim().startsWith('```') && !/^---+$/.test(lines[i].trim())) {
      para.push(lines[i].trim());
      i += 1;
    }
    out.push(`<p>${inlineMd(para.join(' '))}</p>`);
  }

  return out.join('\n');
}

const logoSvg = readFileSync(logoPath, 'utf8');
const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}`;
const md = readFileSync(mdPath, 'utf8');
const bodyHtml = mdToHtml(md);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Human Agile Model Specification | Agile Fragile</title>
  <style>
    @page {
      size: A4;
      margin: 16mm 14mm 18mm;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      font-family: "Helvetica Neue", Arial, sans-serif;
      font-size: 9.5pt;
      line-height: 1.45;
      color: #151517;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .watermark {
      position: fixed;
      top: 38%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-32deg);
      z-index: 0;
      pointer-events: none;
      text-align: center;
      opacity: 0.07;
    }
    .watermark img {
      width: 96px;
      height: 96px;
      display: block;
      margin: 0 auto 10px;
    }
    .watermark p {
      margin: 0;
      font-size: 11pt;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #151517;
    }
    .doc {
      position: relative;
      z-index: 1;
    }
    .doc-header {
      border-bottom: 2px solid #1f35a9;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }
    .doc-header img {
      width: 44px;
      height: 44px;
      vertical-align: middle;
      margin-right: 10px;
    }
    .doc-header .brand {
      display: inline-block;
      vertical-align: middle;
    }
    .doc-header .brand strong {
      display: block;
      font-size: 11pt;
      letter-spacing: -0.02em;
    }
    .doc-header .brand span {
      font-size: 8pt;
      color: #555;
    }
    h1 {
      font-size: 17pt;
      margin: 0 0 4px;
      letter-spacing: -0.02em;
      page-break-after: avoid;
    }
    h2 {
      font-size: 11pt;
      margin: 14px 0 6px;
      color: #1f35a9;
      page-break-after: avoid;
    }
    h3 {
      font-size: 10pt;
      margin: 10px 0 4px;
      page-break-after: avoid;
    }
    p { margin: 0 0 8px; }
    ul, ol { margin: 0 0 8px; padding-left: 18px; }
    li { margin-bottom: 3px; }
    hr {
      border: none;
      border-top: 1px solid #ddd;
      margin: 12px 0;
    }
    pre {
      font-family: "SF Mono", Consolas, monospace;
      font-size: 8pt;
      line-height: 1.35;
      background: #f4f4f6;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 8px 10px;
      white-space: pre-wrap;
      page-break-inside: avoid;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
      margin: 8px 0 10px;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 5px 6px;
      text-align: left;
      vertical-align: top;
    }
    th { background: #f0f0f4; }
    strong { font-weight: 700; }
    em { font-style: italic; }
    a { color: #1f35a9; text-decoration: none; }
    .doc-footer {
      margin-top: 16px;
      padding-top: 8px;
      border-top: 1px solid #ddd;
      font-size: 8pt;
      color: #555;
    }
  </style>
</head>
<body>
  <div class="watermark" aria-hidden="true">
    <img src="${logoDataUri}" alt="">
    <p>Agile Fragile</p>
  </div>
  <article class="doc">
    <header class="doc-header">
      <img src="${logoDataUri}" alt="Agile Fragile">
      <div class="brand">
        <strong>Agile Fragile</strong>
        <span>Human Agile Model™ · Specification · agilefragile.com</span>
      </div>
    </header>
    ${bodyHtml}
    <footer class="doc-footer">
      <p>Copyright © 2026 Anjish Bhondwe. Human Agile™, Human Agile Index™, and Agile Fragile™ are trademarks of Anjish Bhondwe. Trademark applications are pending.</p>
    </footer>
  </article>
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

let printed = false;
let lastError = '';

for (const chrome of chromeCandidates) {
  const result = spawnSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--no-pdf-header-footer',
      `--print-to-pdf=${pdfPath}`,
      htmlPath
    ],
    { encoding: 'utf8' }
  );

  if (result.status === 0) {
    try {
      const size = statSync(pdfPath).size;
      if (size > 5000) {
        printed = true;
        break;
      }
      lastError = `${chrome}: PDF too small (${size} bytes)`;
    } catch {
      lastError = `${chrome}: PDF not written`;
    }
  } else {
    lastError = `${chrome}: ${result.stderr || result.stdout || 'exit ' + result.status}`;
  }
}

try {
  unlinkSync(htmlPath);
} catch {
  /* temp file may already be gone */
}

if (!printed) {
  console.error('Failed to generate specification PDF.');
  console.error(lastError);
  process.exit(1);
}

console.log(`Wrote ${pdfPath} (${statSync(pdfPath).size} bytes)`);
