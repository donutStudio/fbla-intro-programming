"use client";

import { usePetStore } from "@/lib/pet-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Activity } from "lucide-react";
import { getMoodReasons } from "@/lib/domain/petRules";

export function PetInsights() {
  const pet = usePetStore((state) => state.pet);
  const getMood = usePetStore((state) => state.getMood);

  if (!pet) return null;

  const mood = getMood();
  const reasons = getMoodReasons(pet);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" />
          Why is my pet feeling this way?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4 text-primary" />
          <span className="font-medium">Current mood:</span>
          <span className="capitalize">{mood}</span>
        </div>
        {reasons.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Your pet is in great shape! Keep a balanced routine to maintain this mood.
          </p>
        ) : (
          <ul className="space-y-2 text-sm text-muted-foreground">
            {reasons.map((reason) => (
              <li key={reason.label} className="flex flex-col">
                <span className="font-medium text-foreground">{reason.label}</span>
                <span>{reason.detail}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
