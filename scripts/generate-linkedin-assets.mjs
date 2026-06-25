import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

const OUT = 'downloads/linkedin';
const SANS = "Inter, Helvetica, Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

const profileSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#818181"/>
  <text x="200" y="238" text-anchor="middle" fill="#ffffff" font-family="${SANS}" font-size="154" font-weight="700" letter-spacing="-12">AF</text>
</svg>`;

const companyLogoSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="#818181"/>
  <text x="150" y="178" text-anchor="middle" fill="#ffffff" font-family="${SANS}" font-size="116" font-weight="700" letter-spacing="-9">AF</text>
</svg>`;

const bannerSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1584" height="396" viewBox="0 0 1584 396">
  <rect width="1584" height="396" fill="#818181"/>
  <text x="792" y="188" text-anchor="middle" fill="#ffffff" font-family="${SERIF}" font-size="96" font-weight="600" letter-spacing="-3">Life at Agile Fragile</text>
  <text x="792" y="262" text-anchor="middle" fill="#f7f7f7" font-family="${SANS}" font-size="28" font-weight="500" letter-spacing="0.5">Coming soon · agilefragile.com</text>
</svg>`;

const companyCoverSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1128" height="191" viewBox="0 0 1128 191">
  <rect width="1128" height="191" fill="#818181"/>
  <text x="564" y="96" text-anchor="middle" fill="#ffffff" font-family="${SERIF}" font-size="52" font-weight="600" letter-spacing="-2">Life at Agile Fragile</text>
  <text x="564" y="142" text-anchor="middle" fill="#f7f7f7" font-family="${SANS}" font-size="18" font-weight="500" letter-spacing="1">Coming soon</text>
</svg>`;

const exports = [
  { name: 'linkedin-profile-photo-400x400', svg: profileSvg },
  { name: 'linkedin-company-logo-300x300', svg: companyLogoSvg },
  { name: 'linkedin-personal-banner-1584x396', svg: bannerSvg },
  { name: 'linkedin-company-cover-1128x191', svg: companyCoverSvg },
];

await mkdir(OUT, { recursive: true });

for (const item of exports) {
  const base = join(OUT, item.name);
  await writeFile(`${base}.svg`, item.svg);
  await sharp(Buffer.from(item.svg)).png().toFile(`${base}.png`);
}

const readme = `# Agile Fragile — LinkedIn assets

Square bold AF logo for profile/company. Careers-style serif banners.

- linkedin-profile-photo-400x400.png — Profile photo
- linkedin-company-logo-300x300.png — Company logo
- linkedin-personal-banner-1584x396.png — Banner
- linkedin-company-cover-1128x191.png — Company cover

See downloads/logo-variations/ for all square logo variants.
`;

await writeFile(join(OUT, 'README.md'), readme);
console.log(`Done: ${OUT}/`);
