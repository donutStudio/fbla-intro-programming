import type {
  Pet,
  PetEvolution,
  PetMood,
  MoodReason,
  PetEvent,
  Recommendation,
} from "@/lib/domain/types";

export const FOOD_OPTIONS = {
  basic: { cost: 5, hunger: 25, happiness: 5, label: "Basic" },
  premium: { cost: 15, hunger: 40, happiness: 15, label: "Premium" },
  treat: { cost: 8, hunger: 15, happiness: 20, label: "Treat" },
} as const;

export const TOY_OPTIONS = {
  ball: { cost: 10, happiness: 20, energy: -15, label: "Ball" },
  puzzle: { cost: 25, happiness: 30, energy: -10, label: "Puzzle" },
  fetch: { cost: 15, happiness: 25, energy: -20, label: "Fetch" },
} as const;

export const CLEANING_COST = 5;
export const VET_COST = 50;

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, Math.round(value)));

export const getEvolution = (daysPassed: number): PetEvolution => {
  if (daysPassed >= 7) return "adult";
  if (daysPassed >= 3) return "teen";
  return "baby";
};

export const getMoodReasons = (pet: Pet): MoodReason[] => {
  const reasons: MoodReason[] = [];
  if (pet.hunger < 40) {
    reasons.push({
      label: "Hunger",
      detail: `Hunger is ${pet.hunger}%. Pets feel sluggish below 40%.`,
      severity: 100 - pet.hunger,
    });
  }
  if (pet.cleanliness < 40) {
    reasons.push({
      label: "Cleanliness",
      detail: `Cleanliness is ${pet.cleanliness}%. Low hygiene can cause stress.`,
      severity: 100 - pet.cleanliness,
    });
  }
  if (pet.energy < 35) {
    reasons.push({
      label: "Energy",
      detail: `Energy is ${pet.energy}%. Under 35% pets need rest.`,
      severity: 100 - pet.energy,
    });
  }
  if (pet.happiness < 45) {
    reasons.push({
      label: "Happiness",
      detail: `Happiness is ${pet.happiness}%. Play boosts mood quickly.`,
      severity: 100 - pet.happiness,
    });
  }
  if (pet.health < 50) {
    reasons.push({
      label: "Health",
      detail: `Health is ${pet.health}%. Consider a vet visit below 50%.`,
      severity: 100 - pet.health,
    });
  }

  return reasons.sort((a, b) => b.severity - a.severity).slice(0, 4);
};

export const getMoodState = (pet: Pet, previousMood?: PetMood): PetMood => {
  const { hunger, happiness, energy, health, cleanliness } = pet;

  if (health < 25) return "sick";
  if (hunger < 25) return "hungry";
  if (energy < 20) return "tired";

  if (previousMood === "sick" && health < 50) return "sick";
  if (previousMood === "sad" && happiness < 45) return "sad";
  if (previousMood === "tired" && energy < 40) return "tired";

  if (happiness < 30 || cleanliness < 30) return "sad";
  if (happiness > 80 && energy > 60 && hunger > 50) return "energetic";

  return "happy";
};

export const applyDecay = (pet: Pet, hoursPassed: number, demoScale: number) => {
  const scaledHours = hoursPassed * demoScale;
  const hunger = clamp(pet.hunger - scaledHours * 2);
  const happiness = clamp(pet.happiness - scaledHours * 1.2);
  const energy = clamp(pet.energy - scaledHours * 1.4);
  const cleanliness = clamp(pet.cleanliness - scaledHours * 1.1);

  let health = pet.health;
  if (hunger < 35) health -= 3;
  if (cleanliness < 35) health -= 2.5;
  if (energy < 25) health -= 1.5;
  if (hunger > 60 && cleanliness > 60) health += 0.5;

  const updatedPet = {
    ...pet,
    hunger,
    happiness,
    energy,
    cleanliness,
    health: clamp(health),
  };

  const events: PetEvent[] = [];

  if (cleanliness < 30 && Math.random() < 0.2) {
    updatedPet.health = clamp(updatedPet.health - 8);
    updatedPet.happiness = clamp(updatedPet.happiness - 6);
    events.push({
      id: `event-${Date.now()}`,
      type: "warning",
      message: "Uh oh! Fleas appeared because cleanliness was low.",
      timestamp: Date.now(),
    });
  }

  if (hunger < 20 && Math.random() < 0.15) {
    updatedPet.energy = clamp(updatedPet.energy - 10);
    events.push({
      id: `event-${Date.now()}-stomach`,
      type: "warning",
      message: "Your pet has an upset stomach from low hunger.",
      timestamp: Date.now(),
    });
  }

  if (happiness > 85 && Math.random() < 0.1) {
    updatedPet.happiness = clamp(updatedPet.happiness + 5);
    events.push({
      id: `event-${Date.now()}-toy`,
      type: "bonus",
      message: "Lucky find! Your pet discovered a fun toy.",
      timestamp: Date.now(),
    });
  }

  return { updatedPet, events };
};

export const applyFeed = (pet: Pet, foodType: keyof typeof FOOD_OPTIONS) => {
  const option = FOOD_OPTIONS[foodType];
  const hungerBoost = option.hunger + (pet.energy < 30 ? 5 : 0);
  const happinessBoost = option.happiness + (pet.happiness < 40 ? 5 : 0);

  return {
    ...pet,
    hunger: clamp(pet.hunger + hungerBoost),
    happiness: clamp(pet.happiness + happinessBoost),
    cleanliness: clamp(pet.cleanliness - 1),
  };
};

export const applyPlay = (pet: Pet, toyType: keyof typeof TOY_OPTIONS) => {
  const option = TOY_OPTIONS[toyType];
  const energyPenalty = pet.energy < 35 ? option.energy * 0.6 : option.energy;
  const happinessBoost = pet.energy < 35 ? option.happiness * 0.7 : option.happiness;

  return {
    ...pet,
    happiness: clamp(pet.happiness + happinessBoost),
    energy: clamp(pet.energy + energyPenalty),
    cleanliness: clamp(pet.cleanliness - 3),
    hunger: clamp(pet.hunger - 2),
  };
};

export const applyRest = (pet: Pet) => {
  const hungerPenalty = pet.hunger < 25 ? 12 : 8;
  return {
    ...pet,
    energy: clamp(pet.energy + 35),
    hunger: clamp(pet.hunger - hungerPenalty),
    health: clamp(pet.health + 2),
  };
};

export const applyClean = (pet: Pet) => ({
  ...pet,
  cleanliness: 100,
  happiness: clamp(pet.happiness + 10),
});

export const applyVet = (pet: Pet) => ({
  ...pet,
  health: 100,
  happiness: clamp(pet.happiness + 8),
  energy: clamp(pet.energy + 5),
});

export const buildRecommendations = (pet: Pet): Recommendation[] => {
  const recs: Recommendation[] = [];
  if (pet.hunger < 40) {
    recs.push({
      action: "feed",
      reason: "Hunger is running low.",
      impact: "Feeding raises hunger and happiness.",
      confidence: 0.9,
      factors: ["Hunger below 40%", "Energy recovery depends on food"],
    });
  }
  if (pet.energy < 35) {
    recs.push({
      action: "rest",
      reason: "Energy is low.",
      impact: "Rest restores energy and health.",
      confidence: 0.85,
      factors: ["Energy below 35%", "Low energy reduces play effectiveness"],
    });
  }
  if (pet.cleanliness < 40) {
    recs.push({
      action: "clean",
      reason: "Cleanliness is low.",
      impact: "Cleaning prevents sickness and boosts happiness.",
      confidence: 0.8,
      factors: ["Cleanliness below 40%", "Low hygiene impacts health"],
    });
  }
  if (pet.health < 50) {
    recs.push({
      action: "vet",
      reason: "Health needs attention.",
      impact: "A vet visit restores health.",
      confidence: 0.88,
      factors: ["Health below 50%", "Vet reset restores health to 100%"],
    });
  }
  if (pet.happiness < 45 && pet.energy > 25) {
    recs.push({
      action: "play",
      reason: "Happiness could use a boost.",
      impact: "Play increases happiness quickly.",
      confidence: 0.75,
      factors: ["Happiness below 45%", "Energy high enough for play"],
    });
  }

  if (recs.length === 0) {
    recs.push({
      action: "task",
      reason: "Great job! Now build up savings.",
      impact: "Complete tasks to grow your balance.",
      confidence: 0.7,
      factors: ["Stats are stable", "Savings help cover future care"],
    });
  }

  return recs.slice(0, 3);
};
