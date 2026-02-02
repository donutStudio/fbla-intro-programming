import { format } from "date-fns";
import type { Expense, Earning, ExpenseCategory, StatSnapshot } from "@/lib/domain/types";

export type DateRange = "24h" | "7d" | "30d" | "all";

export const filterByRange = (timestamp: number, range: DateRange) => {
  if (range === "all") return true;
  const now = Date.now();
  const hours = range === "24h" ? 24 : range === "7d" ? 24 * 7 : 24 * 30;
  return now - timestamp <= hours * 60 * 60 * 1000;
};

export const getCategoryTotals = (expenses: Expense[]) => {
  return expenses.reduce<Record<ExpenseCategory, number>>(
    (acc, expense) => {
      acc[expense.category] += expense.amount;
      return acc;
    },
    { food: 0, toy: 0, vet: 0, supplies: 0 }
  );
};

export const buildSpendingSeries = (expenses: Expense[], range: DateRange) => {
  const filtered = expenses.filter((expense) => filterByRange(expense.timestamp, range));
  const grouped: Record<string, number> = {};

  filtered.forEach((expense) => {
    const dayKey = format(expense.timestamp, "MMM d");
    grouped[dayKey] = (grouped[dayKey] ?? 0) + expense.amount;
  });

  return Object.entries(grouped).map(([day, amount]) => ({ day, amount }));
};

export const buildEarningsSeries = (earnings: Earning[], range: DateRange) => {
  const filtered = earnings.filter((earning) => filterByRange(earning.timestamp, range));
  const grouped: Record<string, number> = {};

  filtered.forEach((earning) => {
    const dayKey = format(earning.timestamp, "MMM d");
    grouped[dayKey] = (grouped[dayKey] ?? 0) + earning.amount;
  });

  return Object.entries(grouped).map(([day, amount]) => ({ day, amount }));
};

export const calculateProjectedMonthlyCost = (
  expenses: Expense[],
  range: DateRange
) => {
  const filtered = expenses.filter((expense) => filterByRange(expense.timestamp, range));
  if (filtered.length === 0) return 0;
  const oldest = Math.min(...filtered.map((expense) => expense.timestamp));
  const days = Math.max(1, Math.ceil((Date.now() - oldest) / (1000 * 60 * 60 * 24)));
  const total = filtered.reduce((sum, expense) => sum + expense.amount, 0);
  return Math.round((total / days) * 30);
};

export const createExpenseCsv = (expenses: Expense[]) => {
  const header = "date,category,amount,description";
  const rows = expenses.map((expense) =>
    [
      format(expense.timestamp, "yyyy-MM-dd HH:mm"),
      expense.category,
      expense.amount,
      `"${expense.description.replace(/"/g, "''")}"`,
    ].join(",")
  );
  return [header, ...rows].join("\n");
};

export const createEarningsCsv = (earnings: Earning[]) => {
  const header = "date,source,amount,description";
  const rows = earnings.map((earning) =>
    [
      format(earning.timestamp, "yyyy-MM-dd HH:mm"),
      earning.source,
      earning.amount,
      `"${earning.description.replace(/"/g, "''")}"`,
    ].join(",")
  );
  return [header, ...rows].join("\n");
};

export const createStatsCsv = (stats: StatSnapshot[]) => {
  const header =
    "date,hunger,happiness,energy,cleanliness,health,mood,balance";
  const rows = stats.map((snapshot) =>
    [
      format(snapshot.timestamp, "yyyy-MM-dd HH:mm"),
      snapshot.hunger,
      snapshot.happiness,
      snapshot.energy,
      snapshot.cleanliness,
      snapshot.health,
      snapshot.mood,
      snapshot.balance,
    ].join(",")
  );
  return [header, ...rows].join("\n");
};
