import sharp from 'sharp';
import { readFile, mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';

const SRC = 'assets/logo';
const OUT = 'downloads/logos';

const markInner = await readFile(join(SRC, 'af-mark.svg'), 'utf8');
const markMatch = markInner.match(/<g[\s\S]*?<\/g>/);
if (!markMatch) throw new Error('Could not parse af-mark.svg');

function markGroup(color) {
  return markMatch[0].replace(/currentColor/g, color);
}

function squareLogo({ bg, color, label = 'Agile Fragile' }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none" role="img" aria-label="${label}">
  <rect width="120" height="120" fill="${bg}"/>
  <g transform="translate(10 10)">
    ${markGroup(color)}
  </g>
</svg>
`;
}

function favicon({ bg, color }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-label="Agile Fragile">
  <rect width="32" height="32" fill="${bg}"/>
  <g transform="translate(2.7 2.7) scale(0.265)">
    ${markGroup(color)}
  </g>
</svg>
`;
}

function footerWordmark({ color }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" fill="none" role="img" aria-label="Agile Fragile">
  <text x="0" y="34" fill="${color}" font-family="'Newsreader', Georgia, 'Times New Roman', serif" font-size="30" font-weight="600" letter-spacing="-0.02em">Agile</text>
  <text x="0" y="68" fill="${color}" font-family="'Newsreader', Georgia, 'Times New Roman', serif" font-size="30" font-weight="600" letter-spacing="-0.02em">Fragile</text>
</svg>
`;
}

const variants = [
  { file: '01-primary-gray', square: { bg: '#818181', color: '#ffffff' } },
  { file: '02-accent-blue', square: { bg: '#1f35a9', color: '#ffffff' } },
  { file: '03-white-background', square: { bg: '#ffffff', color: '#151517' } },
  { file: '04-black-background', square: { bg: '#151517', color: '#ffffff' } },
];

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

for (const v of variants) {
  const svg = squareLogo(v.square);
  await writeFile(join(OUT, `${v.file}.svg`), svg);
  await sharp(Buffer.from(svg)).resize(400, 400).png().toFile(join(OUT, `${v.file}.png`));
}

const fav = favicon({ bg: '#818181', color: '#ffffff' });
await writeFile(join(OUT, '05-favicon.svg'), fav);
await sharp(Buffer.from(fav)).resize(400, 400).png().toFile(join(OUT, '05-favicon.png'));

const footer = footerWordmark({ color: '#ffffff' });
await writeFile(join(OUT, '06-footer-wordmark.svg'), footer);
await sharp(Buffer.from(footer)).png().toFile(join(OUT, '06-footer-wordmark.png'));

const preview = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Agile Fragile — Logo Preview</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #151517; color: #fff; padding: 40px 24px; }
    h1 { font-size: 1.4rem; margin-bottom: 8px; }
    p { color: #949494; margin-bottom: 32px; max-width: 560px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; max-width: 1100px; }
    .card { background: #222; border-radius: 8px; overflow: hidden; }
    .card img { width: 100%; display: block; }
    .card figcaption { padding: 14px; font-size: 0.85rem; }
    code { display: block; margin-top: 6px; color: #818181; font-size: 0.75rem; }
  </style>
</head>
<body>
  <h1>Agile Fragile — Logo Preview</h1>
  <p>Serif merged AF monogram. Site palette: gray #818181, accent #1f35a9, black #151517. Review here before anything goes to git or the live site.</p>
  <div class="grid">
    <figure class="card"><img src="01-primary-gray.png" alt=""><figcaption>Primary (header)<code>01-primary-gray.png</code></figcaption></figure>
    <figure class="card"><img src="02-accent-blue.png" alt=""><figcaption>Accent blue<code>02-accent-blue.png</code></figcaption></figure>
    <figure class="card"><img src="03-white-background.png" alt=""><figcaption>White background<code>03-white-background.png</code></figcaption></figure>
    <figure class="card"><img src="04-black-background.png" alt=""><figcaption>Black background<code>04-black-background.png</code></figcaption></figure>
    <figure class="card"><img src="05-favicon.png" alt=""><figcaption>Favicon<code>05-favicon.png</code></figcaption></figure>
    <figure class="card"><img src="06-footer-wordmark.png" alt=""><figcaption>Footer wordmark<code>06-footer-wordmark.png</code></figcaption></figure>
  </div>
</body>
</html>
`;
await writeFile(join(OUT, 'preview.html'), preview);

console.log(`Preview logos saved to ${OUT}/ (not committed to git)`);
