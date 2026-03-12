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
  CUSTOMIZATION_DISABLED_MESSAGE,
  type CustomizePetRequest,
  type CustomizePetResponse,
} from "@/lib/domain/pet-customization";

const imageExt = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);

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

export async function POST(req: Request) {
  const body = (await req.json()) as CustomizePetRequest;
  const prompt = body.prompt?.trim() ?? "";
  const availableLayers = await getAvailableLayers();

  // Keep the request/response contract and layer utility hooks in place so
  // OpenAI (or another model provider) can be reintroduced with minimal changes.
    void enforceLayerRules(
    body.currentAppearance?.layerIds ?? [],
    availableLayers.map((layer) => layer.id)
  );

  const response: CustomizePetResponse = {
    appearance: {
      color: null,
      layerIds: null,
    },
    message: prompt
      ? `${CUSTOMIZATION_DISABLED_MESSAGE} Your request was saved as: "${prompt}".`
      : CUSTOMIZATION_DISABLED_MESSAGE,
    customizationAvailable: false,
  };

  return Response.json(response, { status: 503 });
}
