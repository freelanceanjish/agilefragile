import sharp from 'sharp';
import { readdir, readFile, mkdir, writeFile, cp, rm } from 'fs/promises';
import { join } from 'path';

const SRC = 'assets/logo';
const OUT = 'downloads/logo-variations';

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
  <g transform="translate(14 14)">
    ${markGroup(color)}
  </g>
</svg>
`;
}

function favicon({ bg, color }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-label="Agile Fragile">
  <rect width="32" height="32" fill="${bg}"/>
  <g transform="translate(3.8 3.6) scale(0.265)">
    ${markGroup(color)}
  </g>
</svg>
`;
}

function stackedWordmark({ bg, color }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" fill="none" role="img" aria-label="Agile Fragile">
  <rect width="200" height="80" fill="${bg}"/>
  <text x="0" y="34" fill="${color}" font-family="'Newsreader', Georgia, 'Times New Roman', serif" font-size="30" font-weight="600" letter-spacing="-0.02em">Agile</text>
  <text x="0" y="68" fill="${color}" font-family="'Newsreader', Georgia, 'Times New Roman', serif" font-size="30" font-weight="600" letter-spacing="-0.02em">Fragile</text>
</svg>
`;
}

const variants = [
  { file: 'square-af-gray.svg', square: { bg: '#818181', color: '#ffffff' } },
  { file: 'square-af-white.svg', square: { bg: '#ffffff', color: '#151517' } },
  { file: 'square-af-black.svg', square: { bg: '#151517', color: '#ffffff' } },
  { file: 'square-af-accent.svg', square: { bg: '#1f35a9', color: '#ffffff' } },
  { file: 'square-stacked-gray.svg', stacked: { bg: '#818181', color: '#ffffff' } },
  { file: 'square-stacked-white.svg', stacked: { bg: '#ffffff', color: '#151517' } },
  { file: 'square-stacked-black.svg', stacked: { bg: '#151517', color: '#ffffff' } },
];

for (const v of variants) {
  const svg = v.square ? squareLogo(v.square) : stackedWordmark(v.stacked);
  await writeFile(join(SRC, v.file), svg);
}

await writeFile(join(SRC, 'favicon.svg'), favicon({ bg: '#818181', color: '#ffffff' }));

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const files = (await readdir(SRC)).filter((f) => f.endsWith('.svg') && f !== 'af-mark.svg');

for (const file of files) {
  const svg = await readFile(join(SRC, file), 'utf8');
  const base = file.replace('.svg', '');
  await writeFile(join(OUT, file), svg);
  await sharp(Buffer.from(svg)).png().toFile(join(OUT, `${base}.png`));
  await sharp(Buffer.from(svg)).resize(400, 400).png().toFile(join(OUT, `${base}-400.png`));
}

await cp(join(SRC, 'square-af-gray.svg'), 'assets/logo.svg');
await cp(join(SRC, 'square-af-gray.svg'), 'assets/logo-mark.svg');
await cp(join(SRC, 'favicon.svg'), 'assets/favicon.svg');

const footerWordmark = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" fill="none" role="img" aria-label="Agile Fragile">
  <text x="0" y="34" fill="#ffffff" font-family="'Newsreader', Georgia, 'Times New Roman', serif" font-size="30" font-weight="600" letter-spacing="-0.02em">Agile</text>
  <text x="0" y="68" fill="#ffffff" font-family="'Newsreader', Georgia, 'Times New Roman', serif" font-size="30" font-weight="600" letter-spacing="-0.02em">Fragile</text>
</svg>
`;
await writeFile('assets/footer-wordmark.svg', footerWordmark);
await writeFile(join(OUT, 'footer-wordmark.svg'), footerWordmark);
await sharp(Buffer.from(footerWordmark)).png().toFile(join(OUT, 'footer-wordmark.png'));

const bundleDir = 'downloads/Agile-Fragile-LinkedIn/logo-variations';
await rm(bundleDir, { recursive: true, force: true });
await mkdir(bundleDir, { recursive: true });
for (const file of await readdir(OUT)) {
  await cp(join(OUT, file), join(bundleDir, file));
}

console.log(`Generated ${files.length + 1} logos in ${OUT}/`);
