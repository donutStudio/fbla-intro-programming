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

export const CUSTOMIZATION_ERROR_MESSAGE =
  "Could not process your customization request right now. Please try again.";
