import type { PetAppearance } from "@/lib/domain/types";

export interface CustomizePetRequest {
  prompt: string;
  currentAppearance?: Partial<PetAppearance>;
}

export interface CustomizePetResponse {
  appearance: {
    color: string | null;
    layerIds: string[] | null;
  };
  message: string;
  customizationAvailable: boolean;
}

export const CUSTOMIZATION_DISABLED_MESSAGE =
  "Natural-language pet customization is temporarily unavailable.";
