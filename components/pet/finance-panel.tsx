"use client";

import { useMemo, useState } from "react";
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
  PlusCircle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const GOAL_MAX = 10000;
const TASK_REWARD_MAX = 500;

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
    addTask,
  } = usePetStore();

  const [customGoal, setCustomGoal] = useState("");
  const [goalTouched, setGoalTouched] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskReward, setTaskReward] = useState("");
  const [taskTouched, setTaskTouched] = useState(false);

  const savingsProgress = Math.min((balance / savingsGoal) * 100, 100);
  const recentExpenses = expenses.slice(-5).reverse();

  const goalErrors = useMemo(() => {
    const errors: string[] = [];
    const value = Number(customGoal);
    if (!customGoal.trim()) {
      errors.push("Enter a goal amount.");
    } else if (Number.isNaN(value)) {
      errors.push("Goal must be a number.");
    } else {
      if (value <= 0) errors.push("Goal must be greater than 0.");
      if (value > GOAL_MAX) errors.push(`Goal must be under $${GOAL_MAX}.`);
    }
    return errors;
  }, [customGoal]);

  const taskErrors = useMemo(() => {
    const errors: string[] = [];
    const reward = Number(taskReward);
    if (!taskName.trim()) errors.push("Task name is required.");
    if (!taskReward.trim()) {
      errors.push("Reward is required.");
    } else if (Number.isNaN(reward)) {
      errors.push("Reward must be a number.");
    } else {
      if (reward <= 0) errors.push("Reward must be greater than 0.");
      if (reward > TASK_REWARD_MAX) {
        errors.push(`Reward must be under $${TASK_REWARD_MAX}.`);
      }
    }
    return errors;
  }, [taskName, taskReward]);

  const handleGoalSubmit = () => {
    const value = Number(customGoal);
    const result = setSavingsGoal(value);
    if (result.ok) {
      toast.success(result.message);
      setCustomGoal("");
      setGoalTouched(false);
    } else {
      toast.error(result.message);
    }
  };

  const handleTaskSubmit = () => {
    const reward = Number(taskReward);
    const result = addTask({ name: taskName.trim(), reward });
    if (result.ok) {
      toast.success(result.message);
      setTaskName("");
      setTaskReward("");
      setTaskTouched(false);
    } else {
      toast.error(result.message);
    }
  };

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
        <CardContent className="space-y-3">
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
          <div className="flex flex-wrap gap-2">
            {[100, 200, 500].map((goal) => (
              <Button
                key={goal}
                variant={savingsGoal === goal ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => {
                  const result = setSavingsGoal(goal);
                  if (result.ok) toast.success(result.message);
                  else toast.error(result.message);
                }}
              >
                ${goal}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom-goal" className="text-xs">
              Custom goal
            </Label>
            <Input
              id="custom-goal"
              placeholder="Enter custom goal"
              value={customGoal}
              onChange={(event) => {
                setCustomGoal(event.target.value);
                setGoalTouched(true);
              }}
              onBlur={() => setGoalTouched(true)}
            />
            {goalTouched && goalErrors.length > 0 && (
              <div className="text-xs text-red-500 space-y-1">
                {goalErrors.length > 1 && (
                  <p>Please fix the following:</p>
                )}
                {goalErrors.map((error) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            )}
            <Button
              size="sm"
              className="w-full"
              onClick={handleGoalSubmit}
              disabled={goalErrors.length > 0}
            >
              Set Goal
            </Button>
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
        <CardContent className="space-y-3">
          <ScrollArea className="h-44">
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
                        onClick={() => {
                          const result = completeTask(task.id);
                          if (result.ok) toast.success(result.message);
                          else toast.error(result.message);
                        }}
                      >
                        Done
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="space-y-2">
            <Label htmlFor="task-name" className="text-xs">
              Add a new task
            </Label>
            <Input
              id="task-name"
              placeholder="Task title"
              value={taskName}
              onChange={(event) => {
                setTaskName(event.target.value);
                setTaskTouched(true);
              }}
              onBlur={() => setTaskTouched(true)}
            />
            <Input
              id="task-reward"
              placeholder="Reward amount"
              value={taskReward}
              onChange={(event) => {
                setTaskReward(event.target.value);
                setTaskTouched(true);
              }}
              onBlur={() => setTaskTouched(true)}
            />
            {taskTouched && taskErrors.length > 0 && (
              <div className="text-xs text-red-500 space-y-1">
                {taskErrors.length > 1 && <p>Please fix the following:</p>}
                {taskErrors.map((error) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            )}
            <Button
              size="sm"
              className="w-full"
              onClick={handleTaskSubmit}
              disabled={taskErrors.length > 0}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
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
                      {expense.category}
                    </span>
                    <span>{expense.description}</span>
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
