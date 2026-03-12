# PetPal

A simple virtual pet app built with Next.js.

## 1) Requirements

- Node.js 18+
- pnpm (recommended) or npm

## 2) Install

```bash
pnpm install
```

## 3) Environment variables

No required environment variables for local development.

## 4) Run the app

```bash
pnpm dev
```

Then open `http://localhost:3000`.

---

## Dynamic avatar setup (emoji + layers)

Dynamic mode uses the **same emoji pet**, with:
- color tinting
- optional layered images (like sunglasses/hat/scarf)

### Add your own layer images

1. Put image files in:

```text
public/pet-layers/
```

2. Name each file with a stable ID, e.g. `cool-hat.png` → layer ID is `cool-hat`.

3. Add metadata in:

- `lib/pet-layer-config.ts`

That file controls:
- layer labels/tags
- layer slot (`head`, `face`, `neck`, `back`, `body`, `extra`)
- mutually exclusive slots to prevent overlapping conflicts

### Where mutual exclusivity is configured

- `MUTUALLY_EXCLUSIVE_SLOTS` in `lib/pet-layer-config.ts`

By default, only one layer is allowed per exclusive slot, so combinations stay logical.

### Customizer route status

The route file still exists for future model-provider integration:
- `app/api/customize-pet/route.ts`

For now, it returns a typed "temporarily unavailable" response and does not call OpenAI.

---

## Helpful scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```
