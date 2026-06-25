import sharp from 'sharp';
import { readdir, readFile, mkdir, writeFile, cp } from 'fs/promises';
import { join } from 'path';

const SRC = 'assets/logo';
const OUT = 'downloads/logo-variations';

await mkdir(OUT, { recursive: true });

const files = (await readdir(SRC)).filter((f) => f.endsWith('.svg'));

for (const file of files) {
  const svg = await readFile(join(SRC, file), 'utf8');
  const base = file.replace('.svg', '');
  await writeFile(join(OUT, file), svg);
  await sharp(Buffer.from(svg)).png().toFile(join(OUT, `${base}.png`));
}

// Sync primary assets used by the site
await cp(join(SRC, 'wordmark-white.svg'), 'assets/logo.svg');
await cp(join(SRC, 'mark-af-white.svg'), 'assets/logo-mark.svg');
await cp(join(SRC, 'favicon.svg'), 'assets/favicon.svg');

// Refresh desktop download bundle
const bundleDir = 'downloads/Agile-Fragile-LinkedIn/logo-variations';
await mkdir(bundleDir, { recursive: true });
for (const file of files) {
  await cp(join(OUT, file), join(bundleDir, file));
  if (!file.includes('README')) {
    const base = file.replace('.svg', '');
    await cp(join(OUT, `${base}.png`), join(bundleDir, `${base}.png`));
  }
}

console.log(`Generated ${files.length} logo variations (SVG + PNG) in ${OUT}/`);
