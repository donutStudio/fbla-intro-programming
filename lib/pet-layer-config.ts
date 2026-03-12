export type PetLayerSlot = "back" | "head" | "face" | "neck" | "body" | "extra";

export interface PetLayerDefinition {
  id: string;
  file: string;
  label: string;
  slot: PetLayerSlot;
  tags: string[];
}

export const PET_LAYER_CONFIG: Record<string, Omit<PetLayerDefinition, "id" | "file">> = {
  "blue-sunglasses": {
    label: "Blue Sunglasses",
    slot: "face",
    tags: ["sunglasses", "cool", "shades", "glasses", "blue"],
  },
};

export const LAYER_SLOT_PRIORITY: PetLayerSlot[] = ["back", "body", "neck", "head", "face", "extra"];

export const MUTUALLY_EXCLUSIVE_SLOTS: PetLayerSlot[] = ["back", "head", "face", "neck", "body"];

export const PET_LAYER_DIRECTORY = "public/pet-layers";
