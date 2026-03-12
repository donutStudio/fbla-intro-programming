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

Create a `.env.local` file in the project root:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

## 4) Run the app

```bash
pnpm dev
```

Then open `http://localhost:3000`.

---

## Dynamic avatar setup (emoji + AI layers)

Dynamic mode now uses the **same emoji pet**, with:
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
- layer labels/tags (what the LLM uses to choose a layer)
- layer slot (`head`, `face`, `neck`, `back`, `body`, `extra`)
- mutually exclusive slots to prevent overlapping conflicts

### Where mutual exclusivity is configured

- `MUTUALLY_EXCLUSIVE_SLOTS` in `lib/pet-layer-config.ts`

By default, only one layer is allowed per exclusive slot, so combinations stay logical.

### How AI chooses layers

The API route:
- reads files from `public/pet-layers`
- sends available layers + tags + slots to the LLM
- enforces slot conflict rules before applying changes

Route file:
- `app/api/customize-pet/route.ts`

---

## Helpful scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```
