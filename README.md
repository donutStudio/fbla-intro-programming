# PetPal Virtual Pet + Financial Responsibility

## Project Overview
PetPal is a virtual pet simulator that teaches responsible pet ownership and budgeting at the same time. You create a custom pet, design its appearance, watch its stats change over time, and make care decisions that influence mood, health, and growth. Every care action has a real in-game cost, so players must earn money, set savings goals, and balance essentials vs. fun. PetPal tracks expenses by category, visualizes spending trends, and includes an Ask PetPal assistant for recommendations. The pet evolves across life stages, earns new visual traits like wings, learns tricks, and reacts emotionally to how well it is treated.
Players can also create local accounts to save their pets, log in from the same device, and connect with friends to view each other's pets.

## How to Run
### Requirements
- Node.js 18+
- pnpm (or npm/yarn)

### Install
```bash
pnpm install
```

### Development server
```bash
pnpm dev
```

### Production build
```bash
pnpm build
```

### Start production
```bash
pnpm start
```

## How to Play
0. Create a local account (signup or login) so your pet is saved to your profile.
1. Create and customize your pet (type, name, and appearance).
2. Monitor stats (hunger, happiness, energy, cleanliness, health).
3. Use care actions (feed, play, rest, clean, vet) to keep your pet healthy.
4. Complete tasks to earn money and set savings goals.
5. Review analytics and reports to understand spending habits.
6. Visit the Friends tab to send requests and compare pets.

### Stat Meaning & Decay
- **Hunger:** drops over time; feed to restore.
- **Happiness:** drops with neglect; play or clean to boost.
- **Energy:** drops with time and play; rest restores energy.
- **Cleanliness:** drops over time; low cleanliness hurts health.
- **Health:** affected by hunger/cleanliness; vet visits restore health.

Time-based decay runs continuously, speeds up as your pet ages, and is accelerated in Demo Mode.

### Actions Available
- **Feed:** costs money, increases hunger and happiness.
- **Play:** costs money, boosts happiness, uses energy.
- **Rest:** restores energy, slightly lowers hunger.
- **Clean:** costs money, restores cleanliness.
- **Vet:** costs money, restores health and gives a badge.

### Money, Goals, and Savings
- Tasks add earnings and raise your balance.
- Spending is categorized (food, toys, vet, supplies).
- Savings goals track progress and help keep a budget buffer.

## Financial System
- **Expense categories:** food, toys, vet, supplies.
- **Tracking:** every expense is timestamped with category + description.
- **Reporting:** analytics dashboard includes spending breakdowns, time-based charts, cost-per-day, and projections.
- **Export:** CSV report downloads expense + earning history for documentation.

## Intelligent Features
- **Ask PetPal Q&A:** rules-based responses to budget, care, and mood questions.
- **Recommendations:** data-driven suggestions with “Why this?” explanations.
- **Optional ML insight:** on-device probability scoring for next-best action.

## Accounts & Friends (Local)
- **Accounts:** Sign up or log in to save your pet on the current device.
- **Persistence:** Each account stores its own pet data and progress.
- **Friends:** Send requests by username and view your friends' pets.

## Libraries and Templates
- Next.js / React
- Zustand (state management)
- Recharts (charts)
- Radix UI + shadcn/ui components
- Tailwind CSS

## Credits / Attributions
- No external assets used beyond emoji and built-in icon libraries.
