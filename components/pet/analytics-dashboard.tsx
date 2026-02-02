"use client";

import { useMemo, useState } from "react";
import { usePetStore } from "@/lib/pet-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  DateRange,
  calculateProjectedMonthlyCost,
  buildSpendingSeries,
  buildEarningsSeries,
  getCategoryTotals,
  filterByRange,
  createExpenseCsv,
  createEarningsCsv,
  createStatsCsv,
} from "@/lib/domain/economy";
import { Download, Printer, TrendingUp } from "lucide-react";
import type { ExpenseCategory } from "@/lib/domain/types";

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  food: "#f97316",
  toy: "#8b5cf6",
  vet: "#22c55e",
  supplies: "#06b6d4",
};

export function AnalyticsDashboard() {
  const { expenses, earnings, statsHistory, totalSpent, totalEarned, pet } =
    usePetStore();
  const [range, setRange] = useState<DateRange>("7d");
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "all">(
    "all"
  );

  const filteredExpenses = useMemo(() => {
    return expenses.filter(
      (expense) =>
        filterByRange(expense.timestamp, range) &&
        (categoryFilter === "all" || expense.category === categoryFilter)
    );
  }, [expenses, range, categoryFilter]);

  const categoryTotals = useMemo(
    () => getCategoryTotals(filteredExpenses),
    [filteredExpenses]
  );

  const pieData = useMemo(
    () =>
      Object.entries(categoryTotals).map(([category, value]) => ({
        name: category,
        value,
      })),
    [categoryTotals]
  );

  const spendingSeries = useMemo(
    () => buildSpendingSeries(filteredExpenses, range),
    [filteredExpenses, range]
  );

  const earningsSeries = useMemo(
    () => buildEarningsSeries(earnings, range),
    [earnings, range]
  );

  const daysOwned = pet
    ? Math.max(1, Math.ceil((Date.now() - pet.createdAt) / (1000 * 60 * 60 * 24)))
    : 1;
  const costPerDay = Math.round(totalSpent / daysOwned);
  const projectedMonthly = calculateProjectedMonthlyCost(expenses, range);

  const handleExportCsv = () => {
    const expenseCsv = createExpenseCsv(expenses);
    const earningCsv = createEarningsCsv(earnings);
    const statsCsv = createStatsCsv(statsHistory);

    const blob = new Blob([`${expenseCsv}\n\n${earningCsv}\n\n${statsCsv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "petpal-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const reportWindow = window.open("", "", "width=900,height=700");
    if (!reportWindow) return;
    reportWindow.document.write(`
      <html>
        <head>
          <title>PetPal Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>PetPal Summary Report</h1>
          <p><strong>Pet:</strong> ${pet ? pet.name : "N/A"}</p>
          <p><strong>Total Spent:</strong> $${totalSpent}</p>
          <p><strong>Total Earned:</strong> $${totalEarned}</p>
          <p><strong>Net:</strong> $${totalEarned - totalSpent}</p>
          <h2>Category Breakdown</h2>
          <table>
            <tr><th>Category</th><th>Total</th></tr>
            ${Object.entries(categoryTotals)
              .map(([category, value]) => `<tr><td>${category}</td><td>$${value}</td></tr>`)
              .join("")}
          </table>
          <h2>Goals</h2>
          <p>Daily cost estimate: $${costPerDay}</p>
          <p>Projected monthly cost (based on ${range}): $${projectedMonthly}</p>
        </body>
      </html>
    `);
    reportWindow.document.close();
    reportWindow.focus();
    reportWindow.print();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Analytics & Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {(["24h", "7d", "30d", "all"] as DateRange[]).map((option) => (
              <Button
                key={option}
                size="sm"
                variant={range === option ? "default" : "outline"}
                onClick={() => setRange(option)}
              >
                {option === "24h" ? "24h" : option}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={categoryFilter}
              onValueChange={(value) =>
                setCategoryFilter(value as ExpenseCategory | "all")
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="toy">Toys</SelectItem>
                <SelectItem value="vet">Vet</SelectItem>
                <SelectItem value="supplies">Supplies</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Spending Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" label>
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={CATEGORY_COLORS[entry.name as ExpenseCategory]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Spending Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spendingSeries}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#f97316" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cost per Day</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${costPerDay}</p>
            <p className="text-xs text-muted-foreground">
              Total spent ÷ {daysOwned} days owned
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Projected Monthly Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${projectedMonthly}</p>
            <p className="text-xs text-muted-foreground">
              Based on {range} average spending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Earnings vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Earned", value: totalEarned },
                    { name: "Spent", value: totalSpent },
                  ]}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Earnings Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={earningsSeries}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#22c55e" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
