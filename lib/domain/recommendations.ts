import type { Pet, Recommendation, PetMood } from "@/lib/domain/types";
import { buildRecommendations } from "@/lib/domain/petRules";

type QuestionIntent =
  | "why-sick"
  | "save-money"
  | "next-action"
  | "improve-happiness"
  | "balance-drop"
  | "stat-explain"
  | "unknown";

const detectIntent = (question: string): QuestionIntent => {
  const q = question.toLowerCase();
  if (q.includes("sick") || q.includes("health")) return "why-sick";
  if (q.includes("save") || q.includes("budget") || q.includes("money"))
    return "save-money";
  if (q.includes("next") || q.includes("should")) return "next-action";
  if (q.includes("happy") || q.includes("happiness")) return "improve-happiness";
  if (q.includes("balance") || q.includes("dropping")) return "balance-drop";
  if (q.includes("why") || q.includes("mood")) return "stat-explain";
  return "unknown";
};

const moodDescriptions: Record<PetMood, string> = {
  happy: "Your pet feels calm and cared for.",
  sad: "Your pet needs more fun or comfort.",
  hungry: "Your pet wants food and a snack soon.",
  tired: "Your pet needs a rest to recharge.",
  sick: "Your pet needs care or a vet visit.",
  energetic: "Your pet has lots of energy and wants to play.",
};

const softmax = (scores: number[]) => {
  const exp = scores.map((score) => Math.exp(score));
  const total = exp.reduce((sum, value) => sum + value, 0) || 1;
  return exp.map((value) => value / total);
};

export const getMlProbabilities = (pet: Pet) => {
  const scores = [
    0.04 * (100 - pet.hunger),
    0.03 * (100 - pet.happiness),
    0.04 * (100 - pet.energy),
    0.03 * (100 - pet.cleanliness),
    0.05 * (100 - pet.health),
  ];
  const [feed, play, rest, clean, vet] = softmax(scores);
  return {
    feed,
    play,
    rest,
    clean,
    vet,
  };
};

export const buildAnswer = (
  question: string,
  pet: Pet,
  balance: number,
  totalSpent: number,
  totalEarned: number
) => {
  const intent = detectIntent(question);
  const recommendations = buildRecommendations(pet);
  const ml = getMlProbabilities(pet);

  switch (intent) {
    case "why-sick":
      return {
        title: "Health Check",
        summary: `Your pet's health is at ${pet.health}%. ${moodDescriptions.sick}`,
        tips: [
          "Schedule a vet visit for a full reset to 100%.",
          "Keep hunger and cleanliness above 40%.",
          "Rest helps energy and recovery between vet visits.",
        ],
        recommendations,
        ml,
      };
    case "save-money":
      return {
        title: "Saving Tips",
        summary: `You've earned $${totalEarned} and spent $${totalSpent}. Aim to keep a buffer of $50+ before big purchases.`,
        tips: [
          "Choose basic food when your pet is stable.",
          "Complete two tasks before buying toys.",
          "Set a weekly savings goal and stick to it.",
        ],
        recommendations,
        ml,
      };
    case "next-action":
      return {
        title: "Next Best Action",
        summary: `Based on current stats, the best move is to ${recommendations[0].action}.`,
        tips: [
          `Mood: ${moodDescriptions[pet.mood]}`,
          `Current balance: $${balance}. Prioritize essential care first.`,
        ],
        recommendations,
        ml,
      };
    case "improve-happiness":
      return {
        title: "Happiness Booster",
        summary: `Happiness is ${pet.happiness}%. Play and clean-ups increase happiness quickly.`,
        tips: [
          "Play with a low-cost toy if energy is above 25%.",
          "Use treats after a rest to stack happiness gains.",
          "Keep cleanliness high to avoid mood penalties.",
        ],
        recommendations,
        ml,
      };
    case "balance-drop":
      return {
        title: "Balance Change",
        summary: `Recent expenses can reduce your balance quickly. Your balance is $${balance}.`,
        tips: [
          "Vet visits and toys are the largest single expenses.",
          "Use tasks to refill funds before non-essential purchases.",
          "Set a spending cap in the Analytics filters.",
        ],
        recommendations,
        ml,
      };
    case "stat-explain":
      return {
        title: "Mood Breakdown",
        summary: `Mood: ${pet.mood}. ${moodDescriptions[pet.mood]}`,
        tips: [
          "Check the 'Why is my pet feeling this way?' panel for thresholds.",
          "Fix the lowest stat first to improve mood quickly.",
          "Use Demo Mode to see faster stat changes.",
        ],
        recommendations,
        ml,
      };
    default:
      return {
        title: "Ask PetPal",
        summary: "Ask about health, savings, or what to do next!",
        tips: [
          "Try: 'Why is my pet sick?'",
          "Try: 'How do I save money?'",
          "Try: 'What should I do next?'",
        ],
        recommendations,
        ml,
      };
  }
};

export const getRecommendationFactors = (recommendation: Recommendation) => {
  return recommendation.factors.join(" • ");
};
