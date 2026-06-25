import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

const OUT = 'downloads/linkedin';

const profileSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#818181"/>
  <g transform="translate(200 200)">
    <path d="M0 -72a72 72 0 1 1-50.91 21.09" stroke="#ffffff" stroke-width="11" stroke-linecap="round" fill="none"/>
    <path d="M0 -72a72 72 0 1 0 50.91 21.09" stroke="#ffffff" stroke-width="11" stroke-linecap="round" fill="none" opacity="0.25"/>
    <path d="M-28 -46h56" stroke="#1f35a9" stroke-width="11" stroke-linecap="round"/>
    <circle cx="0" cy="0" r="14" fill="#1f35a9"/>
  </g>
</svg>`;

const companyLogoSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="#818181"/>
  <g transform="translate(150 150)">
    <path d="M0 -54a54 54 0 1 1-38.18 15.82" stroke="#ffffff" stroke-width="8.5" stroke-linecap="round" fill="none"/>
    <path d="M0 -54a54 54 0 1 0 38.18 15.82" stroke="#ffffff" stroke-width="8.5" stroke-linecap="round" fill="none" opacity="0.25"/>
    <path d="M-21 -34.5h42" stroke="#1f35a9" stroke-width="8.5" stroke-linecap="round"/>
    <circle cx="0" cy="0" r="10.5" fill="#1f35a9"/>
  </g>
</svg>`;

const bannerSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1584" height="396" viewBox="0 0 1584 396">
  <rect width="1584" height="396" fill="#818181"/>
  <rect x="0" y="320" width="1584" height="76" fill="#151517"/>
  <g transform="translate(120 88)">
    <path d="M0 0a56 56 0 1 1-39.6 16.4" stroke="#ffffff" stroke-width="7" stroke-linecap="round" fill="none"/>
    <path d="M0 0a56 56 0 1 0 39.6 16.4" stroke="#ffffff" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.25"/>
    <path d="M-22 18h44" stroke="#1f35a9" stroke-width="7" stroke-linecap="round"/>
    <circle cx="0" cy="56" r="11" fill="#1f35a9"/>
  </g>
  <text x="220" y="148" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-size="92" font-weight="600" letter-spacing="-2">Agile Fragile</text>
  <text x="220" y="228" fill="#f7f7f7" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="500" letter-spacing="0.5">Build things people actually want.</text>
  <text x="220" y="360" fill="#949494" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="500" letter-spacing="2">COMING SOON  ·  AGILEFRAGILE.COM</text>
</svg>`;

const companyCoverSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1128" height="191" viewBox="0 0 1128 191">
  <rect width="1128" height="191" fill="#818181"/>
  <rect x="0" y="145" width="1128" height="46" fill="#151517"/>
  <g transform="translate(56 42)">
    <path d="M0 0a34 34 0 1 1-24 9.95" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <path d="M0 0a34 34 0 1 0 24 9.95" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.25"/>
    <path d="M-13.5 11h27" stroke="#1f35a9" stroke-width="4.5" stroke-linecap="round"/>
    <circle cx="0" cy="34" r="6.5" fill="#1f35a9"/>
  </g>
  <text x="130" y="88" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-size="54" font-weight="600" letter-spacing="-1">Agile Fragile</text>
  <text x="130" y="132" fill="#f7f7f7" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="500">A new way to think about agility.</text>
  <text x="130" y="176" fill="#949494" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="500" letter-spacing="1.5">COMING SOON</text>
</svg>`;

const wordmarkLightSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="220" viewBox="0 0 1200 220">
  <rect width="1200" height="220" fill="#818181"/>
  <g transform="translate(80 48)">
    <path d="M0 0a56 56 0 1 1-39.6 16.4" stroke="#ffffff" stroke-width="7" stroke-linecap="round" fill="none"/>
    <path d="M0 0a56 56 0 1 0 39.6 16.4" stroke="#ffffff" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.25"/>
    <path d="M-22 18h44" stroke="#1f35a9" stroke-width="7" stroke-linecap="round"/>
    <circle cx="0" cy="56" r="11" fill="#1f35a9"/>
  </g>
  <text x="200" y="118" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-size="88" font-weight="600" letter-spacing="-2">Agile Fragile</text>
</svg>`;

const wordmarkDarkSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="220" viewBox="0 0 1200 220">
  <rect width="1200" height="220" fill="#ffffff"/>
  <g transform="translate(80 48)">
    <path d="M0 0a56 56 0 1 1-39.6 16.4" stroke="#151517" stroke-width="7" stroke-linecap="round" fill="none"/>
    <path d="M0 0a56 56 0 1 0 39.6 16.4" stroke="#151517" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.2"/>
    <path d="M-22 18h44" stroke="#1f35a9" stroke-width="7" stroke-linecap="round"/>
    <circle cx="0" cy="56" r="11" fill="#1f35a9"/>
  </g>
  <text x="200" y="118" fill="#151517" font-family="Georgia, 'Times New Roman', serif" font-size="88" font-weight="600" letter-spacing="-2">Agile Fragile</text>
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

Use these files when uploading to LinkedIn.

## Personal profile

| File | Size | Where to upload |
|------|------|-----------------|
| linkedin-profile-photo-400x400.png | 400×400 | Profile photo |
| linkedin-personal-banner-1584x396.png | 1584×396 | Profile background banner |

## Company page

| File | Size | Where to upload |
|------|------|-----------------|
| linkedin-company-logo-300x300.png | 300×300 | Company logo |
| linkedin-company-cover-1128x191.png | 1128×191 | Company cover image |

## Extra assets

| File | Use |
|------|-----|
| logo-wordmark-gray-1200x220.png | Posts, presentations, gray background |
| logo-wordmark-white-bg-1200x220.png | Documents, light backgrounds |
| *.svg | Editable source files |

## Download all

From GitHub: open this folder and download individual files, or download the whole repo as ZIP.
`;

await writeFile(join(OUT, 'README.md'), readme);
console.log(`Generated ${exports.length * 2} image files + SVG sources in ${OUT}/`);
