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

- Replace `your_openai_api_key_here` with your real OpenAI key.
- This is required for **AI pet appearance customization** (dynamic appearance from prompt text).

## 4) Run the app

```bash
pnpm dev
```

Then open:

- `http://localhost:3000`

## 5) Build for production (optional)

```bash
pnpm build
pnpm start
```

---

## Dynamic Pet Appearance (OpenAI) — quick setup

To make pet appearance change based on user prompts:

1. Add `OPENAI_API_KEY` to `.env.local` (see above).
2. Start the app with `pnpm dev`.
3. Open the app and go to the AI customization area.
4. Enter prompts like:
   - `Make my pet blue`
   - `Give my pet sparkly eyes`
   - `Add angel wings`

If the API key is missing or invalid, the AI customization request will fail.

---

## Helpful scripts

```bash
pnpm dev     # start local dev server
pnpm build   # build production app
pnpm start   # run production build
pnpm lint    # run lint checks
```
