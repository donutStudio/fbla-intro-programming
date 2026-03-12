export type PetType = "cat" | "dog" | "bunny" | "hamster";
export type PetMood =
  | "happy"
  | "sad"
  | "hungry"
  | "tired"
  | "sick"
  | "energetic";
export type PetEvolution = "baby" | "teen" | "adult";
export type PetColor = string;
export type PetEyeStyle = "round" | "sparkle" | "sleepy";
export type PetAccessory = "none" | "bow" | "hat" | "bandana";
export type PetWingStyle = "none" | "angel" | "fairy";

export interface PetAppearance {
  color: PetColor;
  eyeStyle: PetEyeStyle;
  accessory: PetAccessory;
  wingStyle: PetWingStyle;
  layerIds?: string[];
  specialSprite?: "blue-sunglasses";
}

export type ExpenseCategory = "food" | "toy" | "vet" | "supplies";

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  timestamp: number;
}

export interface Earning {
  id: string;
  source: "task" | "bonus";
  description: string;
  amount: number;
  timestamp: number;
}

export interface Task {
  id: string;
  name: string;
  reward: number;
  completed: boolean;
  createdAt: number;
  availableAt: number;
  cooldownMs: number;
  completedAt?: number;
}

export interface StatSnapshot {
  id: string;
  timestamp: number;
  hunger: number;
  happiness: number;
  energy: number;
  cleanliness: number;
  health: number;
  mood: PetMood;
  balance: number;
}

export interface PetEvent {
  id: string;
  type: "bonus" | "warning" | "milestone";
  message: string;
  timestamp: number;
}

export interface Pet {
  name: string;
  type: PetType;
  hunger: number; // 0-100
  happiness: number; // 0-100
  energy: number; // 0-100
  health: number; // 0-100
  cleanliness: number; // 0-100
  age: number; // days
  evolution: PetEvolution;
  mood: PetMood;
  appearance: PetAppearance;
  tricks: string[];
  badges: string[];
  createdAt: number;
  lastInteraction: number;
  lastUpdated: number;
}

export interface MoodReason {
  label: string;
  detail: string;
  severity: number;
}

export interface Recommendation {
  action: "feed" | "play" | "rest" | "clean" | "vet" | "task";
  reason: string;
  impact: string;
  confidence: number;
  factors: string[];
}

export interface ActionResult {
  ok: boolean;
  message: string;
  reason?: string;
}
