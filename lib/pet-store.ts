import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Pet,
  PetType,
  PetMood,
  PetEvolution,
  PetAppearance,
  Expense,
  Earning,
  Task,
  StatSnapshot,
  PetEvent,
  ActionResult,
} from "@/lib/domain/types";
import {
  FOOD_OPTIONS,
  TOY_OPTIONS,
  CLEANING_COST,
  VET_COST,
  applyFeed,
  applyPlay,
  applyRest,
  applyClean,
  applyVet,
  applyDecay,
  getMoodState,
  getEvolution,
} from "@/lib/domain/petRules";

export type AvatarMode = "emoji" | "dynamic";

// Re-export types for backward compatibility
export type {
  Pet,
  PetType,
  PetMood,
  PetEvolution,
  PetAppearance,
  Expense,
  Task,
};

export interface ChatMessage {
  id: string;
  question: string;
  response: {
    title: string;
    summary: string;
    tips: string[];
    recommendations: Array<{
      action: string;
      reason: string;
      impact: string;
      confidence: number;
      factors: string[];
    }>;
    ml: Record<string, number>;
  };
}

interface GameState {
  pet: Pet | null;
  balance: number;
  savingsGoal: number;
  expenses: Expense[];
  earnings: Earning[];
  tasks: Task[];
  statsHistory: StatSnapshot[];
  events: PetEvent[];
  chatMessages: ChatMessage[];
  totalSpent: number;
  totalEarned: number;
  gameStarted: boolean;
  avatarMode: AvatarMode;
  demoMode: boolean;
}

interface PetStore extends GameState {
  // Setup actions
  createPet: (name: string, type: PetType, appearance: PetAppearance) => void;
  resetGame: () => void;
  setAvatarMode: (mode: AvatarMode) => void;
  setDemoMode: (enabled: boolean) => void;

  // Care actions
  feedPet: (foodType: keyof typeof FOOD_OPTIONS) => ActionResult;
  playWithPet: (toyType: keyof typeof TOY_OPTIONS) => ActionResult;
  restPet: () => ActionResult;
  cleanPet: () => ActionResult;
  vetVisit: () => ActionResult;

  // Financial actions
  completeTask: (taskId: string) => ActionResult;
  setSavingsGoal: (amount: number) => ActionResult;
  addTask: (
    task: Omit<Task, "id" | "completed" | "createdAt" | "availableAt" | "cooldownMs">
  ) => ActionResult;

  // Utility actions
  updatePetStats: () => void;
  getMood: () => PetMood;
  addEvent: (event: PetEvent) => void;
  
  // Chat actions
  addChatMessage: (message: ChatMessage) => void;
  clearChatMessages: () => void;
  
  // Appearance actions
  updatePetAppearance: (appearance: Partial<PetAppearance>) => void;

  // Snapshot actions
  getSnapshot: () => GameState;
  loadSnapshot: (snapshot: GameState | null) => void;
}

const DEFAULT_TASKS: Omit<Task, "id" | "completed" | "createdAt" | "availableAt" | "cooldownMs">[] =
  [
  { name: "Clean your room", reward: 10 },
  { name: "Do homework", reward: 15 },
  { name: "Help with dishes", reward: 8 },
  { name: "Walk the dog (real one!)", reward: 12 },
  { name: "Read for 30 minutes", reward: 10 },
];

const getTaskDelayMs = (reward: number) => {
  const baseDelay = reward * 1000;
  return Math.min(60000, Math.max(2000, baseDelay));
};

const buildTask = (
  task: Omit<Task, "id" | "completed" | "createdAt" | "availableAt" | "cooldownMs">,
  id: string
) => {
  const createdAt = Date.now();
  const cooldownMs = getTaskDelayMs(task.reward);
  return {
    ...task,
    id,
    completed: false,
    createdAt,
    cooldownMs,
    availableAt: createdAt + cooldownMs,
  };
};

const buildTaskList = () =>
  DEFAULT_TASKS.map((task, index) => buildTask(task, `task-${index}`));

export type PetGameSnapshot = GameState;

const buildInitialState = (): GameState => ({
  pet: null,
  balance: 100,
  savingsGoal: 200,
  expenses: [],
  earnings: [],
  tasks: buildTaskList(),
  statsHistory: [],
  events: [],
  chatMessages: [],
  totalSpent: 0,
  totalEarned: 0,
  gameStarted: false,
  avatarMode: "dynamic",
  demoMode: false,
});

const initialState: GameState = buildInitialState();

const DEFAULT_APPEARANCE: PetAppearance = {
  color: "rose",
  eyeStyle: "round",
  accessory: "none",
  wingStyle: "none",
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
        const demoMode = get().demoMode;
        const startingBalance = demoMode ? 250 : get().balance;
        const now = Date.now();
        set({
          pet: {
            name,
            type,
            hunger: demoMode ? 50 : 65,
            happiness: demoMode ? 55 : 75,
            energy: demoMode ? 55 : 75,
            health: demoMode ? 80 : 95,
            cleanliness: demoMode ? 55 : 85,
            age: 0,
            evolution: "baby",
            mood: "happy",
            appearance,
            tricks: [],
            badges: [],
            createdAt: now,
            lastInteraction: now,
            lastUpdated: now,
          },
          balance: startingBalance,
          gameStarted: true,
        });
      },

      resetGame: () => {
        set({
          ...buildInitialState(),
          avatarMode: get().avatarMode,
          demoMode: get().demoMode,
        });
      },

      setAvatarMode: (mode) => {
        set({ avatarMode: mode });
      },

      setDemoMode: (enabled) => {
        set({ demoMode: enabled });
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
        const now = Date.now();
        if (now < task.availableAt) {
          const secondsRemaining = Math.ceil((task.availableAt - now) / 1000);
          return {
            ok: false,
            message: `Task will be ready in ${secondsRemaining}s.`,
          };
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
        const newTask = buildTask(task, `task-${Date.now()}`);

        set({
          tasks: [...get().tasks, newTask],
        });

        return { ok: true, message: "Task added." };
      },

      updatePetStats: () => {
        const state = get();
        if (!state.pet) return;

        const now = Date.now();
        const timeSinceLastInteraction = now - state.pet.lastInteraction;
        const hoursPassed = timeSinceLastInteraction / (1000 * 60 * 60);
        const baseScale = state.demoMode ? 6 : 1.4;

        // Calculate age in days
        const daysPassed = Math.floor((now - state.pet.createdAt) / (1000 * 60 * 60 * 24));
        const evolution: PetEvolution = getEvolution(daysPassed);
        const difficultyScale =
          1 + Math.min(daysPassed, 14) * 0.06 + (evolution === "adult" ? 0.1 : 0);

        const badges = [...state.pet.badges];
        if (daysPassed >= 1 && !badges.includes("First Day")) {
          badges.push("First Day");
        }
        if (daysPassed >= 7 && !badges.includes("Week Veteran")) {
          badges.push("Week Veteran");
        }

        const { updatedPet, events } = applyDecay(
          state.pet,
          hoursPassed,
          baseScale,
          difficultyScale
        );
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

      addChatMessage: (message: ChatMessage) => {
        set({ chatMessages: [message, ...get().chatMessages] });
      },

      clearChatMessages: () => {
        set({ chatMessages: [] });
      },

      updatePetAppearance: (appearance: Partial<PetAppearance>) => {
        const state = get();
        if (!state.pet) return;
        set({
          pet: {
            ...state.pet,
            appearance: {
              ...state.pet.appearance,
              ...appearance,
            },
          },
        });
      },

      getSnapshot: () => {
        const {
          pet,
          balance,
          savingsGoal,
          expenses,
          earnings,
          tasks,
          statsHistory,
          events,
          chatMessages,
          totalSpent,
          totalEarned,
          gameStarted,
          avatarMode,
          demoMode,
        } = get();

        return {
          pet,
          balance,
          savingsGoal,
          expenses,
          earnings,
          tasks,
          statsHistory,
          events,
          chatMessages,
          totalSpent,
          totalEarned,
          gameStarted,
          avatarMode,
          demoMode,
        };
      },

      loadSnapshot: (snapshot) => {
        if (!snapshot) {
          set(buildInitialState());
          return;
        }

        const normalizedTasks =
          snapshot.tasks?.map((task) => {
            const cooldownMs = task.cooldownMs ?? getTaskDelayMs(task.reward);
            const createdAt = task.createdAt ?? Date.now();
            const availableAt = task.availableAt ?? createdAt + cooldownMs;
            return {
              ...task,
              createdAt,
              cooldownMs,
              availableAt,
            };
          }) ?? [];

        set({
          ...buildInitialState(),
          ...snapshot,
          tasks: normalizedTasks,
        });
      },
    }),
    {
      name: "petpal-storage",
    }
  )
);
