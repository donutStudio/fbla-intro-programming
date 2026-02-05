import type { PetAppearance, PetType } from "@/lib/pet-store";

export const PET_OPTIONS: {
  type: PetType;
  emoji: string;
  name: string;
  description: string;
}[] = [
  { type: "cat", emoji: "🐱", name: "Cat", description: "Independent and playful" },
  { type: "dog", emoji: "🐶", name: "Dog", description: "Loyal and energetic" },
  { type: "bunny", emoji: "🐰", name: "Bunny", description: "Gentle and cuddly" },
  { type: "hamster", emoji: "🐹", name: "Hamster", description: "Small and active" },
];

export const APPEARANCE_OPTIONS = {
  color: [
    { key: "charcoal", label: "Charcoal" },
    { key: "golden", label: "Golden" },
    { key: "cream", label: "Cream" },
    { key: "sky", label: "Sky" },
    { key: "rose", label: "Rose" },
  ] as Array<{ key: PetAppearance["color"]; label: string }>,
  pattern: [
    { key: "solid", label: "Solid" },
    { key: "spots", label: "Spots" },
    { key: "stripes", label: "Stripes" },
    { key: "patches", label: "Patches" },
  ] as Array<{ key: PetAppearance["pattern"]; label: string }>,
  accessory: [
    { key: "none", label: "None" },
    { key: "bow", label: "Bow" },
    { key: "collar", label: "Collar" },
    { key: "hat", label: "Hat" },
    { key: "bandana", label: "Bandana" },
  ] as Array<{ key: PetAppearance["accessory"]; label: string }>,
  primaryTrait: [
    { key: "wings", label: "Wings" },
    { key: "crown", label: "Crown" },
    { key: "cape", label: "Cape" },
    { key: "horns", label: "Horns" },
    { key: "backpack", label: "Backpack" },
    { key: "sparkles", label: "Sparkles" },
    { key: "none", label: "None" },
  ] as Array<{ key: PetAppearance["primaryTrait"]; label: string }>,
  secondaryTrait: [
    { key: "none", label: "None" },
    { key: "wings", label: "Wings" },
    { key: "crown", label: "Crown" },
    { key: "cape", label: "Cape" },
    { key: "horns", label: "Horns" },
    { key: "backpack", label: "Backpack" },
    { key: "sparkles", label: "Sparkles" },
  ] as Array<{ key: PetAppearance["secondaryTrait"]; label: string }>,
};
