import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

const OUT = 'downloads/linkedin';

const profileSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#818181"/>
  <rect x="136" y="118" width="48" height="6" fill="#1f35a9" rx="2"/>
  <text x="200" y="228" text-anchor="middle" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-size="108" font-weight="600" letter-spacing="-4">A</text>
  <text x="200" y="292" text-anchor="middle" fill="#f7f7f7" font-family="Georgia, serif" font-size="28" font-style="italic" letter-spacing="1">Fragile</text>
</svg>`;

const companyLogoSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="#818181"/>
  <rect x="102" y="88" width="36" height="5" fill="#1f35a9" rx="2"/>
  <text x="150" y="178" text-anchor="middle" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-size="82" font-weight="600" letter-spacing="-3">A</text>
  <text x="150" y="224" text-anchor="middle" fill="#f7f7f7" font-family="Georgia, serif" font-size="22" font-style="italic">Fragile</text>
</svg>`;

const bannerSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1584" height="396" viewBox="0 0 1584 396">
  <rect width="1584" height="396" fill="#818181"/>
  <rect x="0" y="330" width="1584" height="66" fill="#151517"/>
  <rect x="120" y="96" width="72" height="6" fill="#1f35a9" rx="2"/>
  <text x="120" y="188" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-size="88" font-weight="600" letter-spacing="-3">Agile</text>
  <text x="120" y="268" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-size="88" font-weight="400" font-style="italic" letter-spacing="-2">Fragile</text>
  <text x="120" y="372" fill="#949494" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="500" letter-spacing="3">COMING SOON  ·  AGILEFRAGILE.COM</text>
</svg>`;

const companyCoverSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1128" height="191" viewBox="0 0 1128 191">
  <rect width="1128" height="191" fill="#818181"/>
  <rect x="0" y="148" width="1128" height="43" fill="#151517"/>
  <rect x="56" y="44" width="48" height="4" fill="#1f35a9" rx="1"/>
  <text x="56" y="102" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-size="52" font-weight="600" letter-spacing="-2">Agile</text>
  <text x="168" y="102" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-size="52" font-weight="400" font-style="italic" letter-spacing="-1">Fragile</text>
  <text x="56" y="176" fill="#949494" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="500" letter-spacing="2">COMING SOON</text>
</svg>`;

const wordmarkLightSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="220" viewBox="0 0 1200 220">
  <rect width="1200" height="220" fill="#818181"/>
  <rect x="80" y="48" width="64" height="6" fill="#1f35a9" rx="2"/>
  <text x="80" y="138" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-size="88" font-weight="600" letter-spacing="-3">Agile</text>
  <text x="360" y="138" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-size="88" font-weight="400" font-style="italic" letter-spacing="-2">Fragile</text>
</svg>`;

const wordmarkDarkSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="220" viewBox="0 0 1200 220">
  <rect width="1200" height="220" fill="#ffffff"/>
  <rect x="80" y="48" width="64" height="6" fill="#1f35a9" rx="2"/>
  <text x="80" y="138" fill="#151517" font-family="Georgia, 'Times New Roman', serif" font-size="88" font-weight="600" letter-spacing="-3">Agile</text>
  <text x="360" y="138" fill="#151517" font-family="Georgia, 'Times New Roman', serif" font-size="88" font-weight="400" font-style="italic" letter-spacing="-2">Fragile</text>
</svg>`;

const exports = [
  { name: 'linkedin-profile-photo-400x400', svg: profileSvg, width: 400, height: 400 },
  { name: 'linkedin-company-logo-300x300', svg: companyLogoSvg, width: 300, height: 300 },
  { name: 'linkedin-personal-banner-1584x396', svg: bannerSvg, width: 1584, height: 396 },
  { name: 'linkedin-company-cover-1128x191', svg: companyCoverSvg, width: 1128, height: 191 },
  { name: 'logo-wordmark-gray-1200x220', svg: wordmarkLightSvg, width: 1200, height: 220 },
  { name: 'logo-wordmark-white-bg-1200x220', svg: wordmarkDarkSvg, width: 1200, height: 220 },
];

await mkdir(OUT, { recursive: true });

for (const item of exports) {
  const base = join(OUT, item.name);
  await writeFile(`${base}.svg`, item.svg);
  await sharp(Buffer.from(item.svg)).png().toFile(`${base}.png`);
}

const readme = `# Agile Fragile — LinkedIn Download Pack

## Personal profile
- linkedin-profile-photo-400x400.png — Profile photo (400×400)
- linkedin-personal-banner-1584x396.png — Background banner (1584×396)

## Company page
- linkedin-company-logo-300x300.png — Company logo (300×300)
- linkedin-company-cover-1128x191.png — Cover image (1128×191)

## Extra
- logo-wordmark-gray-1200x220.png — Gray background
- logo-wordmark-white-bg-1200x220.png — White background
- logo.svg / logo-mark.svg / favicon.svg — Source files
`;

await writeFile(join(OUT, 'README.md'), readme);
console.log(`Generated LinkedIn assets in ${OUT}/`);
