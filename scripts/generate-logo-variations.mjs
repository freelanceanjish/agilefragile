import sharp from 'sharp';
import { readdir, readFile, mkdir, writeFile, cp, rm } from 'fs/promises';
import { join } from 'path';

const SRC = 'assets/logo';
const OUT = 'downloads/logo-variations';

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const files = (await readdir(SRC)).filter((f) => f.endsWith('.svg'));

for (const file of files) {
  const svg = await readFile(join(SRC, file), 'utf8');
  const base = file.replace('.svg', '');
  await writeFile(join(OUT, file), svg);
  await sharp(Buffer.from(svg)).png().toFile(join(OUT, `${base}.png`));
  // High-res export for LinkedIn profile (400x400)
  await sharp(Buffer.from(svg)).resize(400, 400).png().toFile(join(OUT, `${base}-400.png`));
}

await cp(join(SRC, 'square-af-gray.svg'), 'assets/logo.svg');
await cp(join(SRC, 'square-af-gray.svg'), 'assets/logo-mark.svg');
await cp(join(SRC, 'favicon.svg'), 'assets/favicon.svg');

const bundleDir = 'downloads/Agile-Fragile-LinkedIn/logo-variations';
await rm(bundleDir, { recursive: true, force: true });
await mkdir(bundleDir, { recursive: true });
for (const file of await readdir(OUT)) {
  await cp(join(OUT, file), join(bundleDir, file));
}

console.log(`Generated ${files.length} square logos in ${OUT}/`);
