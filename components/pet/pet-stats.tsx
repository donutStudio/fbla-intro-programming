"use client";

import React from "react"

import { usePetStore } from "@/lib/pet-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Utensils, Zap, Sparkles, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatBarProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  barColor: string;
}

function StatBar({ label, value, icon, color, barColor }: StatBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("p-1.5 rounded-lg", color)}>{icon}</span>
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <span className="text-sm font-semibold text-foreground">{value}%</span>
      </div>
      <div
        className={cn(
          "relative h-3 w-full overflow-hidden rounded-full bg-muted",
          value < 30 && "animate-pulse"
        )}
      >
        <div
          className={cn(
            "h-full transition-all duration-500 rounded-full",
            barColor
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function PetStats() {
  const pet = usePetStore((state) => state.pet);

  if (!pet) return null;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Pet Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <StatBar
          label="Hunger"
          value={pet.hunger}
          icon={<Utensils className="h-4 w-4 text-amber-600" />}
          color="bg-amber-100"
          barColor="bg-gradient-to-r from-amber-400 to-orange-500"
        />
        <StatBar
          label="Happiness"
          value={pet.happiness}
          icon={<Heart className="h-4 w-4 text-pink-600" />}
          color="bg-pink-100"
          barColor="bg-gradient-to-r from-pink-400 to-rose-500"
        />
        <StatBar
          label="Energy"
          value={pet.energy}
          icon={<Zap className="h-4 w-4 text-blue-600" />}
          color="bg-blue-100"
          barColor="bg-gradient-to-r from-blue-400 to-indigo-500"
        />
        <StatBar
          label="Cleanliness"
          value={pet.cleanliness}
          icon={<Sparkles className="h-4 w-4 text-cyan-600" />}
          color="bg-cyan-100"
          barColor="bg-gradient-to-r from-cyan-400 to-teal-500"
        />
        <StatBar
          label="Health"
          value={pet.health}
          icon={<Activity className="h-4 w-4 text-green-600" />}
          color="bg-green-100"
          barColor="bg-gradient-to-r from-green-400 to-emerald-500"
        />
      </CardContent>
    </Card>
  );
}
