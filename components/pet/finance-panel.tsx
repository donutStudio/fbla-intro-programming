"use client";

import { usePetStore } from "@/lib/pet-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  DollarSign,
  ListTodo,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function FinancePanel() {
  const {
    balance,
    savingsGoal,
    expenses,
    tasks,
    totalSpent,
    totalEarned,
    completeTask,
    setSavingsGoal,
  } = usePetStore();

  const savingsProgress = Math.min((balance / savingsGoal) * 100, 100);
  const recentExpenses = expenses.slice(-5).reverse();

  return (
    <div className="space-y-4">
      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-4xl font-bold text-foreground">${balance}</p>
            </div>
            <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center">
              <Wallet className="h-7 w-7 text-primary" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Earned</p>
                <p className="font-semibold text-green-600">${totalEarned}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-xs text-muted-foreground">Spent</p>
                <p className="font-semibold text-red-600">${totalSpent}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Savings Goal */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Savings Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                ${balance} / ${savingsGoal}
              </span>
              <span className="font-medium">{Math.round(savingsProgress)}%</span>
            </div>
            <Progress value={savingsProgress} className="h-2" />
            {balance >= savingsGoal && (
              <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Goal reached! Great job saving!
              </p>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            {[100, 200, 500].map((goal) => (
              <Button
                key={goal}
                variant={savingsGoal === goal ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => setSavingsGoal(goal)}
              >
                ${goal}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-primary" />
            Earn Money
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg transition-all",
                    task.completed
                      ? "bg-muted/50 opacity-60"
                      : "bg-secondary hover:bg-secondary/80"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {task.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span
                      className={cn(
                        "text-sm",
                        task.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {task.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="text-xs bg-green-100 text-green-700"
                    >
                      +${task.reward}
                    </Badge>
                    {!task.completed && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => completeTask(task.id)}
                      >
                        Done
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Recent Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentExpenses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No expenses yet. Start caring for your pet!
            </p>
          ) : (
            <div className="space-y-2">
              {recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="capitalize text-muted-foreground">
                      {expense.type}
                    </span>
                    <span>{expense.name}</span>
                  </div>
                  <span className="font-medium text-red-600">
                    -${expense.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
