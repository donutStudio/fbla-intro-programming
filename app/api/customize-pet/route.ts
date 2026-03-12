import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { readdir } from "node:fs/promises";
import { constants } from "node:fs";
import { access } from "node:fs/promises";
import path from "node:path";
import {
  MUTUALLY_EXCLUSIVE_SLOTS,
  PET_LAYER_CONFIG,
  PET_LAYER_DIRECTORY,
  type PetLayerSlot,
} from "@/lib/pet-layer-config";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const appearanceSchema = z.object({
  color: z.string().min(1).nullable(),
  layerIds: z.array(z.string()).nullable(),
});

const imageExt = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);

const getAvailableLayers = async () => {
  const layerDir = path.join(process.cwd(), PET_LAYER_DIRECTORY);

  try {
    await access(layerDir, constants.R_OK);
  } catch {
    // No layer directory yet is a valid state; color-only customization should still work.
    return [];
  }

  const files = await readdir(layerDir);

  return files
    .filter((file) => imageExt.has(path.extname(file).toLowerCase()))
    .map((file) => {
      const id = path.basename(file, path.extname(file));
      const config = PET_LAYER_CONFIG[id];
      return {
        id,
        file,
        label: config?.label ?? id,
        slot: (config?.slot ?? "extra") as PetLayerSlot,
        tags: config?.tags ?? [id],
      };
    });
};

const enforceLayerRules = (requestedLayerIds: string[], availableLayerIds: string[]) => {
  const allowSet = new Set(availableLayerIds);
  const filtered = requestedLayerIds.filter((layerId) => allowSet.has(layerId));

  const chosenBySlot = new Map<string, string>();

  for (const layerId of filtered) {
    const slot = (PET_LAYER_CONFIG[layerId]?.slot ?? "extra") as PetLayerSlot;
    if (MUTUALLY_EXCLUSIVE_SLOTS.includes(slot)) {
      chosenBySlot.set(slot, layerId);
    } else {
      chosenBySlot.set(`extra-${layerId}`, layerId);
    }
  }

  return Array.from(chosenBySlot.values());
};

export async function POST(req: Request) {
  const { prompt, currentAppearance } = await req.json();

  const availableLayers = await getAvailableLayers();

  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    system: `You customize a virtual pet that is rendered as an emoji with optional image layers.

Current appearance:
- Color: ${currentAppearance?.color ?? "#ff6fa1"}
- Active layer IDs: ${(currentAppearance?.layerIds ?? []).join(", ") || "none"}

Color handling:
- You may return any valid CSS color value (hex, rgb, hsl, named colors).
- Prefer vivid, noticeable colors when the user asks for a color change.

Available image layers from /public/pet-layers:
${
  availableLayers.length > 0
    ? availableLayers
        .map(
          (layer) =>
            `- ${layer.id} (slot: ${layer.slot}, tags: ${layer.tags.join(", ")})`
        )
        .join("\n")
    : "- none currently available"
}

Rules:
- Keep layers logically compatible.
- For mutually exclusive slots (back, head, face, neck, body), choose at most one layer per slot.
- Return color only when user asks for color change.
- Return full layerIds array only when user asks to add/remove/swap/clear layered images.
- If user says remove all accessories/layers, return layerIds as empty array.
- If no layer change needed, return layerIds as null.
- If no color change needed, return color as null.

Respond with valid JSON only.`,
    prompt,
    schema: z.object({
      appearance: appearanceSchema,
      message: z.string().describe("A short friendly response explaining what changed."),
    }),
  });

  const response = result.object;
  const requestedLayerIds = response?.appearance?.layerIds ?? null;
  const safeLayerIds = requestedLayerIds
    ? enforceLayerRules(
        requestedLayerIds,
        availableLayers.map((layer) => layer.id)
      )
    : null;

  return Response.json({
    appearance: {
      color: response?.appearance?.color ?? null,
      layerIds: safeLayerIds,
    },
    message: response?.message ?? "Updated!",
  });
}
