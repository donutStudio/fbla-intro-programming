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
    { key: "rose", label: "Rose" },
    { key: "sky", label: "Sky" },
    { key: "emerald", label: "Emerald" },
    { key: "amber", label: "Amber" },
    { key: "lavender", label: "Lavender" },
  ] as Array<{ key: PetAppearance["color"]; label: string }>,
  eyeStyle: [
    { key: "round", label: "Round" },
    { key: "sparkle", label: "Sparkle" },
    { key: "sleepy", label: "Sleepy" },
  ] as Array<{ key: PetAppearance["eyeStyle"]; label: string }>,
  accessory: [
    { key: "none", label: "None" },
    { key: "bow", label: "Bow" },
    { key: "hat", label: "Hat" },
    { key: "bandana", label: "Bandana" },
  ] as Array<{ key: PetAppearance["accessory"]; label: string }>,
  wingStyle: [
    { key: "none", label: "None" },
    { key: "angel", label: "Angel" },
    { key: "fairy", label: "Fairy" },
  ] as Array<{ key: PetAppearance["wingStyle"]; label: string }>,
};
