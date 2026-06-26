# Agile Fragile — Logo System

Merged **AF** monogram inspired by classic serif and geometric lettermark references. Built from vector paths (not web fonts) so it renders consistently everywhere.

## Design

- **Mark:** Shared stem — the right leg of **A** is the vertical of **F**
- **Serif feet** at the base of each leg
- **Slanted F bars** for forward motion
- **Typography:** Newsreader for stacked wordmarks (matches site headlines)
- **Palette:** Gray `#818181`, black `#151517`, white, accent `#1f35a9`

## Source

| File | Purpose |
|------|---------|
| `af-mark.svg` | Monogram paths only (edit this, then regenerate) |

## AF mark (square)

| File | Background | Mark |
|------|------------|------|
| `square-af-gray.svg` | Gray `#818181` | White — **primary (header)** |
| `square-af-white.svg` | White | Black |
| `square-af-black.svg` | Black `#151517` | White |
| `square-af-accent.svg` | Blue `#1f35a9` | White |

## Stacked wordmark

| File | Background | Text |
|------|------------|------|
| `square-stacked-gray.svg` | Gray | White |
| `square-stacked-white.svg` | White | Black |
| `square-stacked-black.svg` | Black | White |

## Deployed assets

| File | Use |
|------|-----|
| `../logo-mark.svg` | Site header (36×36) |
| `../logo.svg` | Full square mark |
| `../footer-wordmark.svg` | Footer (Newsreader stacked) |
| `../favicon.svg` | Browser tab |

## Regenerate

```bash
node scripts/generate-logo-variations.mjs
```

PNG exports land in `downloads/logo-variations/`.
