# Placeholder icons

These are temporary placeholder slots pending a hand-drawn icon commission.
**Do not use in production builds.**

## Replacing icons

Drop a 512×512 PNG into this directory using the slug as the filename:

- `la-milpa.png` — The three-sisters bed (gardening, permaculture, farming)
- `las-abejas.png` — The honeybees (beekeeping)
- `la-gallina.png` — The hen (chicken and poultry keeping)
- `el-pan.png` — The bread (sourdough and scratch baking)
- `la-conserva.png` — The preserve jar (canning, jelly, bone broth)
- `la-cisterna.png` — The cistern (rainwater and watershed)
- `la-azuela.png` — The adze (building and woodwork)
- `el-telar.png` — The loom (mending and textiles)
- `el-jabon.png` — The soap (soap making)
- `las-yerbas.png` — The herbs (natural medicine and remedies)

Components reference these via `src/lib/icons.ts` — replacing files alone
is enough; no code changes are required.

## Render rules

- 512×512 square PNG, transparent background
- Centered, consistent padding across all ten
- Single-color line art on transparent background, mesquite green or black
