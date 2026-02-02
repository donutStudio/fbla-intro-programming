import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PetType = "cat" | "dog" | "bunny" | "hamster";
export type PetMood =
  | "happy"
  | "sad"
  | "hungry"
  | "tired"
  | "sick"
  | "energetic";
export type PetEvolution = "baby" | "teen" | "adult";

export interface Expense {
  id: string;
  type: "food" | "toy" | "vet" | "supplies";
  name: string;
  amount: number;
  timestamp: number;
}

export interface Task {
  id: string;
  name: string;
  reward: number;
  completed: boolean;
  completedAt?: number;
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
  tricks: string[];
  badges: string[];
  createdAt: number;
  lastInteraction: number;
}

export interface GameState {
  pet: Pet | null;
  balance: number;
  savingsGoal: number;
  expenses: Expense[];
  tasks: Task[];
  totalSpent: number;
  totalEarned: number;
  gameStarted: boolean;
}

interface PetStore extends GameState {
  // Setup actions
  createPet: (name: string, type: PetType) => void;
  resetGame: () => void;

  // Care actions
  feedPet: (foodType: "basic" | "premium" | "treat") => void;
  playWithPet: (toyType: "ball" | "puzzle" | "fetch") => void;
  restPet: () => void;
  cleanPet: () => void;
  vetVisit: () => void;

  // Financial actions
  completeTask: (taskId: string) => void;
  setSavingsGoal: (amount: number) => void;
  addTask: (task: Omit<Task, "id" | "completed">) => void;

  // Utility actions
  updatePetStats: () => void;
  getMood: () => PetMood;
}

const FOOD_COSTS = { basic: 5, premium: 15, treat: 8 };
const FOOD_HUNGER = { basic: 25, premium: 40, treat: 15 };
const FOOD_HAPPINESS = { basic: 5, premium: 15, treat: 20 };

const TOY_COSTS = { ball: 10, puzzle: 25, fetch: 15 };
const TOY_HAPPINESS = { ball: 20, puzzle: 30, fetch: 25 };
const TOY_ENERGY = { ball: -15, puzzle: -10, fetch: -20 };

const VET_COST = 50;
const CLEANING_COST = 5;

const DEFAULT_TASKS: Omit<Task, "id" | "completed">[] = [
  { name: "Clean your room", reward: 10 },
  { name: "Do homework", reward: 15 },
  { name: "Help with dishes", reward: 8 },
  { name: "Walk the dog (real one!)", reward: 12 },
  { name: "Read for 30 minutes", reward: 10 },
];

const initialState: GameState = {
  pet: null,
  balance: 100,
  savingsGoal: 200,
  expenses: [],
  tasks: DEFAULT_TASKS.map((t, i) => ({
    ...t,
    id: `task-${i}`,
    completed: false,
  })),
  totalSpent: 0,
  totalEarned: 0,
  gameStarted: false,
};

export const usePetStore = create<PetStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      createPet: (name: string, type: PetType) => {
        set({
          pet: {
            name,
            type,
            hunger: 70,
            happiness: 80,
            energy: 80,
            health: 100,
            cleanliness: 90,
            age: 0,
            evolution: "baby",
            tricks: [],
            badges: [],
            createdAt: Date.now(),
            lastInteraction: Date.now(),
          },
          gameStarted: true,
        });
      },

      resetGame: () => {
        set({
          ...initialState,
          tasks: DEFAULT_TASKS.map((t, i) => ({
            ...t,
            id: `task-${i}`,
            completed: false,
          })),
        });
      },

      feedPet: (foodType) => {
        const state = get();
        if (!state.pet) return;

        const cost = FOOD_COSTS[foodType];
        if (state.balance < cost) return;

        const newExpense: Expense = {
          id: `exp-${Date.now()}`,
          type: "food",
          name: `${foodType} food`,
          amount: cost,
          timestamp: Date.now(),
        };

        set({
          pet: {
            ...state.pet,
            hunger: Math.min(100, state.pet.hunger + FOOD_HUNGER[foodType]),
            happiness: Math.min(
              100,
              state.pet.happiness + FOOD_HAPPINESS[foodType]
            ),
            lastInteraction: Date.now(),
          },
          balance: state.balance - cost,
          expenses: [...state.expenses, newExpense],
          totalSpent: state.totalSpent + cost,
        });
      },

      playWithPet: (toyType) => {
        const state = get();
        if (!state.pet) return;

        const cost = TOY_COSTS[toyType];
        if (state.balance < cost) return;
        if (state.pet.energy < 20) return;

        const newExpense: Expense = {
          id: `exp-${Date.now()}`,
          type: "toy",
          name: `${toyType} toy`,
          amount: cost,
          timestamp: Date.now(),
        };

        // Chance to learn a trick
        const tricks = [...state.pet.tricks];
        const possibleTricks = ["sit", "roll over", "high five", "spin", "play dead"];
        const unlearnedTricks = possibleTricks.filter((t) => !tricks.includes(t));
        if (unlearnedTricks.length > 0 && Math.random() < 0.2) {
          tricks.push(unlearnedTricks[Math.floor(Math.random() * unlearnedTricks.length)]);
        }

        set({
          pet: {
            ...state.pet,
            happiness: Math.min(100, state.pet.happiness + TOY_HAPPINESS[toyType]),
            energy: Math.max(0, state.pet.energy + TOY_ENERGY[toyType]),
            tricks,
            lastInteraction: Date.now(),
          },
          balance: state.balance - cost,
          expenses: [...state.expenses, newExpense],
          totalSpent: state.totalSpent + cost,
        });
      },

      restPet: () => {
        const state = get();
        if (!state.pet) return;

        set({
          pet: {
            ...state.pet,
            energy: Math.min(100, state.pet.energy + 40),
            hunger: Math.max(0, state.pet.hunger - 10),
            lastInteraction: Date.now(),
          },
        });
      },

      cleanPet: () => {
        const state = get();
        if (!state.pet) return;

        if (state.balance < CLEANING_COST) return;

        const newExpense: Expense = {
          id: `exp-${Date.now()}`,
          type: "supplies",
          name: "Cleaning supplies",
          amount: CLEANING_COST,
          timestamp: Date.now(),
        };

        set({
          pet: {
            ...state.pet,
            cleanliness: 100,
            happiness: Math.min(100, state.pet.happiness + 10),
            lastInteraction: Date.now(),
          },
          balance: state.balance - CLEANING_COST,
          expenses: [...state.expenses, newExpense],
          totalSpent: state.totalSpent + CLEANING_COST,
        });
      },

      vetVisit: () => {
        const state = get();
        if (!state.pet) return;

        if (state.balance < VET_COST) return;

        const newExpense: Expense = {
          id: `exp-${Date.now()}`,
          type: "vet",
          name: "Vet checkup",
          amount: VET_COST,
          timestamp: Date.now(),
        };

        // Award health badge if first vet visit
        const badges = [...state.pet.badges];
        if (!badges.includes("Health Champion")) {
          badges.push("Health Champion");
        }

        set({
          pet: {
            ...state.pet,
            health: 100,
            badges,
            lastInteraction: Date.now(),
          },
          balance: state.balance - VET_COST,
          expenses: [...state.expenses, newExpense],
          totalSpent: state.totalSpent + VET_COST,
        });
      },

      completeTask: (taskId: string) => {
        const state = get();
        const task = state.tasks.find((t) => t.id === taskId);
        if (!task || task.completed) return;

        // Award badge for first task
        let badges = state.pet?.badges || [];
        if (state.pet && !badges.includes("Hard Worker")) {
          badges = [...badges, "Hard Worker"];
        }

        set({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: true, completedAt: Date.now() } : t
          ),
          balance: state.balance + task.reward,
          totalEarned: state.totalEarned + task.reward,
          pet: state.pet
            ? {
                ...state.pet,
                badges,
              }
            : null,
        });
      },

      setSavingsGoal: (amount: number) => {
        set({ savingsGoal: amount });
      },

      addTask: (task) => {
        const state = get();
        set({
          tasks: [
            ...state.tasks,
            { ...task, id: `task-${Date.now()}`, completed: false },
          ],
        });
      },

      updatePetStats: () => {
        const state = get();
        if (!state.pet) return;

        const now = Date.now();
        const timeSinceLastInteraction = now - state.pet.lastInteraction;
        const hoursPassed = timeSinceLastInteraction / (1000 * 60 * 60);

        // Stats decay over time
        const decayRate = 2;
        const decay = Math.floor(hoursPassed * decayRate);

        // Calculate age in days
        const daysPassed = Math.floor((now - state.pet.createdAt) / (1000 * 60 * 60 * 24));

        // Evolution based on age
        let evolution: PetEvolution = "baby";
        if (daysPassed >= 7) evolution = "adult";
        else if (daysPassed >= 3) evolution = "teen";

        // Award age badges
        const badges = [...state.pet.badges];
        if (daysPassed >= 1 && !badges.includes("First Day")) {
          badges.push("First Day");
        }
        if (daysPassed >= 7 && !badges.includes("Week Veteran")) {
          badges.push("Week Veteran");
        }

        // Health affected by low stats
        let healthChange = 0;
        if (state.pet.hunger < 20) healthChange -= 5;
        if (state.pet.cleanliness < 20) healthChange -= 3;

        set({
          pet: {
            ...state.pet,
            hunger: Math.max(0, state.pet.hunger - decay),
            happiness: Math.max(0, state.pet.happiness - Math.floor(decay * 0.5)),
            energy: Math.min(100, state.pet.energy + Math.floor(decay * 0.3)),
            cleanliness: Math.max(0, state.pet.cleanliness - Math.floor(decay * 0.3)),
            health: Math.max(0, Math.min(100, state.pet.health + healthChange)),
            age: daysPassed,
            evolution,
            badges,
          },
        });
      },

      getMood: () => {
        const state = get();
        if (!state.pet) return "happy";

        const { hunger, happiness, energy, health, cleanliness } = state.pet;

        if (health < 30) return "sick";
        if (hunger < 30) return "hungry";
        if (energy < 20) return "tired";
        if (happiness < 30) return "sad";
        if (happiness > 80 && energy > 60) return "energetic";
        return "happy";
      },
    }),
    {
      name: "petpal-storage",
    }
  )
);
