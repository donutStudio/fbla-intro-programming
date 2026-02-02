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
export type PetColor = "charcoal" | "golden" | "cream" | "sky" | "rose";
export type PetPattern = "solid" | "spots" | "stripes" | "patches";
export type PetAccessory = "none" | "bow" | "collar" | "hat" | "bandana";
export type PetTrait =
  | "none"
  | "wings"
  | "crown"
  | "cape"
  | "horns"
  | "backpack"
  | "sparkles";
export type AvatarMode = "emoji" | "dynamic";

export interface PetAppearance {
  color: PetColor;
  pattern: PetPattern;
  accessory: PetAccessory;
  primaryTrait: PetTrait;
  secondaryTrait: PetTrait;
}

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
  appearance: PetAppearance;
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
  earnings: Earning[];
  tasks: Task[];
  statsHistory: StatSnapshot[];
  events: PetEvent[];
  totalSpent: number;
  totalEarned: number;
  gameStarted: boolean;
  avatarMode: AvatarMode;
}

interface PetStore extends GameState {
  // Setup actions
  createPet: (name: string, type: PetType, appearance: PetAppearance) => void;
  resetGame: () => void;
  setAvatarMode: (mode: AvatarMode) => void;

  // Care actions
  feedPet: (foodType: keyof typeof FOOD_OPTIONS) => ActionResult;
  playWithPet: (toyType: keyof typeof TOY_OPTIONS) => ActionResult;
  restPet: () => ActionResult;
  cleanPet: () => ActionResult;
  vetVisit: () => ActionResult;

  // Financial actions
  completeTask: (taskId: string) => ActionResult;
  setSavingsGoal: (amount: number) => ActionResult;
  addTask: (task: Omit<Task, "id" | "completed" | "createdAt">) => ActionResult;

  // Utility actions
  updatePetStats: () => void;
  getMood: () => PetMood;
  addEvent: (event: PetEvent) => void;
}

const DEFAULT_TASKS: Omit<Task, "id" | "completed" | "createdAt">[] = [
  { name: "Clean your room", reward: 10 },
  { name: "Do homework", reward: 15 },
  { name: "Help with dishes", reward: 8 },
  { name: "Walk the dog (real one!)", reward: 12 },
  { name: "Read for 30 minutes", reward: 10 },
];

const buildTaskList = () =>
  DEFAULT_TASKS.map((task, index) => ({
    ...task,
    id: `task-${index}`,
    completed: false,
    createdAt: Date.now(),
  }));

const initialState: GameState = {
  pet: null,
  balance: 100,
  savingsGoal: 200,
  expenses: [],
  earnings: [],
  tasks: buildTaskList(),
  statsHistory: [],
  events: [],
  totalSpent: 0,
  totalEarned: 0,
  gameStarted: false,
  avatarMode: "dynamic",
};

const DEFAULT_APPEARANCE: PetAppearance = {
  color: "golden",
  pattern: "solid",
  accessory: "none",
  primaryTrait: "wings",
  secondaryTrait: "none",
};

const recordSnapshot = (pet: Pet, balance: number): StatSnapshot => ({
  id: `snap-${Date.now()}`,
  timestamp: Date.now(),
  hunger: pet.hunger,
  happiness: pet.happiness,
  energy: pet.energy,
  cleanliness: pet.cleanliness,
  health: pet.health,
  mood: pet.mood,
  balance,
});

export const usePetStore = create<PetStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      createPet: (name: string, type: PetType, appearance: PetAppearance) => {
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
            appearance,
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
          avatarMode: get().avatarMode,
        });
      },

      setAvatarMode: (mode) => {
        set({ avatarMode: mode });
      },

      feedPet: (foodType) => {
        const state = get();
        if (!state.pet) return { ok: false, message: "No pet found." };

        const option = FOOD_OPTIONS[foodType];
        if (state.balance < option.cost) {
          return { ok: false, message: `Need $${option.cost} to feed.` };
        }

        const newExpense: Expense = {
          id: `exp-${Date.now()}`,
          category: "food",
          description: `${option.label} food`,
          amount: option.cost,
          timestamp: Date.now(),
        };

        const updatedPet = applyFeed(state.pet, foodType);
        updatedPet.lastInteraction = Date.now();
        updatedPet.mood = getMoodState(updatedPet, state.pet.mood);

        set({
          pet: updatedPet,
          balance: state.balance - option.cost,
          expenses: [...state.expenses, newExpense],
          totalSpent: state.totalSpent + option.cost,
          statsHistory: [...state.statsHistory, recordSnapshot(updatedPet, state.balance - option.cost)],
        });

        return { ok: true, message: `${state.pet.name} enjoyed the meal!` };
      },

      playWithPet: (toyType) => {
        const state = get();
        if (!state.pet) return { ok: false, message: "No pet found." };

        const option = TOY_OPTIONS[toyType];
        if (state.balance < option.cost) {
          return { ok: false, message: `Need $${option.cost} to play.` };
        }
        if (state.pet.energy < 20) {
          return { ok: false, message: "Too tired to play. Let your pet rest." };
        }

        const newExpense: Expense = {
          id: `exp-${Date.now()}`,
          category: "toy",
          description: `${option.label} toy`,
          amount: option.cost,
          timestamp: Date.now(),
        };

        const tricks = [...state.pet.tricks];
        const possibleTricks = ["sit", "roll over", "high five", "spin", "play dead"];
        const unlearnedTricks = possibleTricks.filter((t) => !tricks.includes(t));
        if (unlearnedTricks.length > 0 && Math.random() < 0.2) {
          tricks.push(
            unlearnedTricks[Math.floor(Math.random() * unlearnedTricks.length)]
          );
        }

        const updatedPet = applyPlay(state.pet, toyType);
        updatedPet.tricks = tricks;
        updatedPet.lastInteraction = Date.now();
        updatedPet.mood = getMoodState(updatedPet, state.pet.mood);

        set({
          pet: updatedPet,
          balance: state.balance - option.cost,
          expenses: [...state.expenses, newExpense],
          totalSpent: state.totalSpent + option.cost,
          statsHistory: [...state.statsHistory, recordSnapshot(updatedPet, state.balance - option.cost)],
        });

        return { ok: true, message: `${state.pet.name} had fun playing!` };
      },

      restPet: () => {
        const state = get();
        if (!state.pet) return { ok: false, message: "No pet found." };

        const updatedPet = applyRest(state.pet);
        updatedPet.lastInteraction = Date.now();
        updatedPet.mood = getMoodState(updatedPet, state.pet.mood);

        set({
          pet: updatedPet,
          statsHistory: [...state.statsHistory, recordSnapshot(updatedPet, state.balance)],
        });

        return { ok: true, message: `${state.pet.name} feels rested.` };
      },

      cleanPet: () => {
        const state = get();
        if (!state.pet) return { ok: false, message: "No pet found." };

        if (state.balance < CLEANING_COST) {
          return { ok: false, message: `Need $${CLEANING_COST} to clean.` };
        }

        const newExpense: Expense = {
          id: `exp-${Date.now()}`,
          category: "supplies",
          description: "Cleaning supplies",
          amount: CLEANING_COST,
          timestamp: Date.now(),
        };

        const updatedPet = applyClean(state.pet);
        updatedPet.lastInteraction = Date.now();
        updatedPet.mood = getMoodState(updatedPet, state.pet.mood);

        set({
          pet: updatedPet,
          balance: state.balance - CLEANING_COST,
          expenses: [...state.expenses, newExpense],
          totalSpent: state.totalSpent + CLEANING_COST,
          statsHistory: [...state.statsHistory, recordSnapshot(updatedPet, state.balance - CLEANING_COST)],
        });

        return { ok: true, message: `${state.pet.name} is sparkling clean!` };
      },

      vetVisit: () => {
        const state = get();
        if (!state.pet) return { ok: false, message: "No pet found." };

        if (state.balance < VET_COST) {
          return { ok: false, message: `Need $${VET_COST} for a vet visit.` };
        }

        const newExpense: Expense = {
          id: `exp-${Date.now()}`,
          category: "vet",
          description: "Vet checkup",
          amount: VET_COST,
          timestamp: Date.now(),
        };

        const badges = [...state.pet.badges];
        if (!badges.includes("Health Champion")) {
          badges.push("Health Champion");
        }

        const updatedPet = applyVet(state.pet);
        updatedPet.badges = badges;
        updatedPet.lastInteraction = Date.now();
        updatedPet.mood = getMoodState(updatedPet, state.pet.mood);

        set({
          pet: updatedPet,
          balance: state.balance - VET_COST,
          expenses: [...state.expenses, newExpense],
          totalSpent: state.totalSpent + VET_COST,
          statsHistory: [...state.statsHistory, recordSnapshot(updatedPet, state.balance - VET_COST)],
        });

        return { ok: true, message: "Vet visit complete. Health restored!" };
      },

      completeTask: (taskId: string) => {
        const state = get();
        const task = state.tasks.find((t) => t.id === taskId);
        if (!task || task.completed) {
          return { ok: false, message: "Task already completed." };
        }

        let badges = state.pet?.badges || [];
        if (state.pet && !badges.includes("Hard Worker")) {
          badges = [...badges, "Hard Worker"];
        }

        const newEarning: Earning = {
          id: `earn-${Date.now()}`,
          source: "task",
          description: task.name,
          amount: task.reward,
          timestamp: Date.now(),
        };

        set({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: true, completedAt: Date.now() } : t
          ),
          balance: state.balance + task.reward,
          totalEarned: state.totalEarned + task.reward,
          earnings: [...state.earnings, newEarning],
          pet: state.pet
            ? {
                ...state.pet,
                badges,
              }
            : null,
        });

        return { ok: true, message: `Earned $${task.reward} for ${task.name}.` };
      },

      setSavingsGoal: (amount: number) => {
        if (Number.isNaN(amount) || amount <= 0) {
          return { ok: false, message: "Goal must be a positive number." };
        }
        set({ savingsGoal: amount });
        return { ok: true, message: `Savings goal set to $${amount}.` };
      },

      addTask: (task) => {
        if (Number.isNaN(task.reward) || task.reward <= 0) {
          return { ok: false, message: "Reward must be a positive number." };
        }
        if (!task.name.trim()) {
          return { ok: false, message: "Task name is required." };
        }

        const newTask = {
          ...task,
          id: `task-${Date.now()}`,
          completed: false,
          createdAt: Date.now(),
        };

        set({
          tasks: [...get().tasks, newTask],
        });

        return { ok: true, message: "Task added." };
      },

      updatePetStats: () => {
        const state = get();
        if (!state.pet) return;

        const now = Date.now();
        const timeSinceLastUpdate = now - state.pet.lastUpdated;
        const hoursPassed = timeSinceLastUpdate / (1000 * 60 * 60);
        const demoScale = state.demoMode ? 360 : 1;

        const daysPassed = Math.floor((now - state.pet.createdAt) / (1000 * 60 * 60 * 24));
        const evolution: PetEvolution = getEvolution(daysPassed);

        const badges = [...state.pet.badges];
        if (daysPassed >= 1 && !badges.includes("First Day")) {
          badges.push("First Day");
        }
        if (daysPassed >= 7 && !badges.includes("Week Veteran")) {
          badges.push("Week Veteran");
        }

        const { updatedPet, events } = applyDecay(state.pet, hoursPassed, demoScale);
        updatedPet.age = daysPassed;
        updatedPet.evolution = evolution;
        updatedPet.badges = badges;
        updatedPet.lastUpdated = now;
        updatedPet.mood = getMoodState(updatedPet, state.pet.mood);

        set({
          pet: updatedPet,
          events: [...state.events, ...events],
          statsHistory: [...state.statsHistory, recordSnapshot(updatedPet, state.balance)],
        });
      },

      getMood: () => {
        const state = get();
        if (!state.pet) return "happy";
        return state.pet.mood;
      },

      addEvent: (event: PetEvent) => {
        set({ events: [...get().events, event] });
      },
    }),
    {
      name: "petpal-storage",
    }
  )
);
