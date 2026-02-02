"use client";

import React from "react"

import { usePetStore } from "@/lib/pet-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Utensils,
  Gamepad2,
  Moon,
  Sparkles,
  Stethoscope,
  Cookie,
  Apple,
  Salad,
  Circle,
  Puzzle,
  Dog,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  cost?: number;
  disabled?: boolean;
  variant?: "default" | "secondary" | "outline";
}

function ActionButton({
  icon,
  label,
  onClick,
  cost,
  disabled,
  variant = "secondary",
}: ActionButtonProps) {
  return (
    <Button
      variant={variant}
      className="h-auto flex-col gap-1 p-3 transition-all hover:scale-105 active:scale-95"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
      {cost !== undefined && (
        <span className="text-[10px] text-muted-foreground">${cost}</span>
      )}
    </Button>
  );
}

interface PetActionsProps {
  onInteraction: () => void;
}

export function PetActions({ onInteraction }: PetActionsProps) {
  const { feedPet, playWithPet, restPet, cleanPet, vetVisit, balance, pet } =
    usePetStore();
  const [feedOpen, setFeedOpen] = useState(false);
  const [playOpen, setPlayOpen] = useState(false);

  const handleAction = (action: () => void) => {
    action();
    onInteraction();
  };

  if (!pet) return null;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-primary" />
          Care Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {/* Feed Popover */}
          <Popover open={feedOpen} onOpenChange={setFeedOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                className="h-auto flex-col gap-1 p-3 transition-all hover:scale-105 active:scale-95"
              >
                <Utensils className="h-5 w-5 text-amber-500" />
                <span className="text-xs font-medium">Feed</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium px-2">
                  Choose food:
                </p>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 h-9"
                  onClick={() => {
                    handleAction(() => feedPet("basic"));
                    setFeedOpen(false);
                  }}
                  disabled={balance < 5}
                >
                  <Salad className="h-4 w-4 text-green-500" />
                  <span>Basic</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    $5
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 h-9"
                  onClick={() => {
                    handleAction(() => feedPet("premium"));
                    setFeedOpen(false);
                  }}
                  disabled={balance < 15}
                >
                  <Apple className="h-4 w-4 text-red-500" />
                  <span>Premium</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    $15
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 h-9"
                  onClick={() => {
                    handleAction(() => feedPet("treat"));
                    setFeedOpen(false);
                  }}
                  disabled={balance < 8}
                >
                  <Cookie className="h-4 w-4 text-amber-500" />
                  <span>Treat</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    $8
                  </span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Play Popover */}
          <Popover open={playOpen} onOpenChange={setPlayOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                className="h-auto flex-col gap-1 p-3 transition-all hover:scale-105 active:scale-95"
                disabled={pet.energy < 20}
              >
                <Gamepad2 className="h-5 w-5 text-pink-500" />
                <span className="text-xs font-medium">Play</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium px-2">
                  Choose activity:
                </p>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 h-9"
                  onClick={() => {
                    handleAction(() => playWithPet("ball"));
                    setPlayOpen(false);
                  }}
                  disabled={balance < 10}
                >
                  <Circle className="h-4 w-4 text-blue-500" />
                  <span>Ball</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    $10
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 h-9"
                  onClick={() => {
                    handleAction(() => playWithPet("puzzle"));
                    setPlayOpen(false);
                  }}
                  disabled={balance < 25}
                >
                  <Puzzle className="h-4 w-4 text-purple-500" />
                  <span>Puzzle</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    $25
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 h-9"
                  onClick={() => {
                    handleAction(() => playWithPet("fetch"));
                    setPlayOpen(false);
                  }}
                  disabled={balance < 15}
                >
                  <Dog className="h-4 w-4 text-amber-600" />
                  <span>Fetch</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    $15
                  </span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Rest */}
          <ActionButton
            icon={<Moon className="h-5 w-5 text-indigo-500" />}
            label="Rest"
            onClick={() => handleAction(restPet)}
          />

          {/* Clean */}
          <ActionButton
            icon={<Sparkles className="h-5 w-5 text-cyan-500" />}
            label="Clean"
            onClick={() => handleAction(cleanPet)}
            cost={5}
            disabled={balance < 5}
          />

          {/* Vet */}
          <ActionButton
            icon={<Stethoscope className="h-5 w-5 text-green-500" />}
            label="Vet"
            onClick={() => handleAction(vetVisit)}
            cost={50}
            disabled={balance < 50}
          />
        </div>

        {pet.energy < 20 && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Your pet is too tired to play. Let them rest first!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
