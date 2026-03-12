import { readdir, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import {
  MUTUALLY_EXCLUSIVE_SLOTS,
  PET_LAYER_CONFIG,
  PET_LAYER_DIRECTORY,
  type PetLayerSlot,
} from "@/lib/pet-layer-config";
import {
  CUSTOMIZATION_ERROR_MESSAGE,
  type CustomizePetRequest,
  type CustomizePetResponse,
} from "@/lib/domain/pet-customization";

const imageExt = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);

// gonna add features before presenting at the competition to make it so we can customize the pet with layeres like glasses hats etc using the ai model as well

const getAvailableLayers = async () => {
  const layerDir = path.join(process.cwd(), PET_LAYER_DIRECTORY);

  try {
    await access(layerDir, constants.R_OK);
  } catch {
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

const isValidCssColor = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return false;

  const hex = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
  const rgb = /^rgba?\((?:\s*\d{1,3}\s*,){2}\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i;
  const hsl = /^hsla?\((?:\s*\d{1,3}\s*,){2}\s*\d{1,3}%?(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i;
  const named = /^[a-z]+$/i;

  return hex.test(trimmed) || rgb.test(trimmed) || hsl.test(trimmed) || named.test(trimmed);
};

const extractColorFromPrompt = async (prompt: string) => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "You extract pet icon colors from user requests. Respond with JSON only: {\"color\": string|null}. Return a valid CSS color in hex/rgb/hsl/named format if a color is requested, otherwise null.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "pet_color",
          strict: true,
          schema: {
            type: "object",
            properties: {
              color: {
                type: ["string", "null"],
              },
            },
            required: ["color"],
            additionalProperties: false,
          },
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error("OpenAI request failed");
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const raw = data.choices?.[0]?.message?.content;
  if (!raw) return null;

  const parsed = JSON.parse(raw) as { color: string | null };
  if (!parsed.color || !isValidCssColor(parsed.color)) return null;
  return parsed.color;
};

export async function POST(req: Request) {
  const body = (await req.json()) as CustomizePetRequest;
  const prompt = body.prompt?.trim() ?? "";

  if (!prompt) {
    const emptyResponse: CustomizePetResponse = {
      appearance: {
        color: null,
        layerIds: null,
      },
      message: "Tell me what color you want for your pet icon.",
      customizationAvailable: true,
    };
    return Response.json(emptyResponse);
  }

  const availableLayers = await getAvailableLayers();
  void enforceLayerRules(
    body.currentAppearance?.layerIds ?? [],
    availableLayers.map((layer) => layer.id)
  );

  try {
    const color = await extractColorFromPrompt(prompt);

    const response: CustomizePetResponse = {
      appearance: {
        color,
        layerIds: null,
      },
      message: color
        ? `Updated your pet color to ${color}.`
        : "I couldn't find a color in that request. Try something like 'make my pet pastel blue'.",
      customizationAvailable: true,
    };

    return Response.json(response);
  } catch {
    const response: CustomizePetResponse = {
      appearance: {
        color: null,
        layerIds: null,
      },
      message: CUSTOMIZATION_ERROR_MESSAGE,
      customizationAvailable: false,
    };

    return Response.json(response, { status: 500 });
  }
}
