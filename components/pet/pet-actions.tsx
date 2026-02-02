"use client";

import React, { useState } from "react";

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
import { toast } from "sonner";
import { FOOD_OPTIONS, TOY_OPTIONS, CLEANING_COST, VET_COST } from "@/lib/domain/petRules";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  cost?: number;
  disabled?: boolean;
  disabledReason?: string;
  variant?: "default" | "secondary" | "outline";
}

function ActionButton({
  icon,
  label,
  onClick,
  cost,
  disabled,
  disabledReason,
  variant = "secondary",
}: ActionButtonProps) {
  return (
    <div className="space-y-1 text-center">
      <Button
        variant={variant}
        className="h-auto w-full flex-col gap-1 p-3 transition-all hover:scale-105 active:scale-95"
        onClick={onClick}
        disabled={disabled}
      >
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-medium">{label}</span>
        {cost !== undefined && (
          <span className="text-[10px] text-muted-foreground">${cost}</span>
        )}
      </Button>
      {disabled && disabledReason && (
        <p className="text-[10px] text-muted-foreground">{disabledReason}</p>
      )}
    </div>
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

  const handleAction = (action: () => { ok: boolean; message: string }) => {
    const result = action();
    if (result.ok) {
      toast.success(result.message);
      onInteraction();
    } else {
      toast.error(result.message);
    }
  };

  if (!pet) return null;

  const playDisabledReason = pet.energy < 20 ? "Too tired" : undefined;
  const restDisabledReason = pet.energy > 95 ? "Already rested" : undefined;
  const cleanDisabledReason = pet.cleanliness > 95 ? "Already clean" : balance < CLEANING_COST ? `Need $${CLEANING_COST}` : undefined;
  const vetDisabledReason = pet.health > 95 ? "Health already high" : balance < VET_COST ? `Need $${VET_COST}` : undefined;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-primary" />
          Care Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
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
            <PopoverContent className="w-56 p-2">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium px-2">
                  Choose food:
                </p>
                {(Object.keys(FOOD_OPTIONS) as Array<keyof typeof FOOD_OPTIONS>).map(
                  (foodType) => {
                    const option = FOOD_OPTIONS[foodType];
                    const disabled = balance < option.cost;
                    return (
                      <Button
                        key={foodType}
                        variant="ghost"
                        className="w-full justify-start gap-2 h-10"
                        onClick={() => {
                          handleAction(() => feedPet(foodType));
                          setFeedOpen(false);
                        }}
                        disabled={disabled}
                      >
                        {foodType === "basic" && (
                          <Salad className="h-4 w-4 text-green-500" />
                        )}
                        {foodType === "premium" && (
                          <Apple className="h-4 w-4 text-red-500" />
                        )}
                        {foodType === "treat" && (
                          <Cookie className="h-4 w-4 text-amber-500" />
                        )}
                        <span>{option.label}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          ${option.cost}
                        </span>
                        {disabled && (
                          <span className="ml-2 text-[10px] text-red-500">
                            Need ${option.cost}
                          </span>
                        )}
                      </Button>
                    );
                  }
                )}
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
            <PopoverContent className="w-56 p-2">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium px-2">
                  Choose activity:
                </p>
                {(Object.keys(TOY_OPTIONS) as Array<keyof typeof TOY_OPTIONS>).map(
                  (toyType) => {
                    const option = TOY_OPTIONS[toyType];
                    const disabled = balance < option.cost || pet.energy < 20;
                    const disabledMessage =
                      pet.energy < 20 ? "Too tired" : `Need $${option.cost}`;
                    return (
                      <Button
                        key={toyType}
                        variant="ghost"
                        className="w-full justify-start gap-2 h-10"
                        onClick={() => {
                          handleAction(() => playWithPet(toyType));
                          setPlayOpen(false);
                        }}
                        disabled={disabled}
                      >
                        {toyType === "ball" && (
                          <Circle className="h-4 w-4 text-blue-500" />
                        )}
                        {toyType === "puzzle" && (
                          <Puzzle className="h-4 w-4 text-purple-500" />
                        )}
                        {toyType === "fetch" && (
                          <Dog className="h-4 w-4 text-amber-600" />
                        )}
                        <span>{option.label}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          ${option.cost}
                        </span>
                        {disabled && (
                          <span className="ml-2 text-[10px] text-red-500">
                            {disabledMessage}
                          </span>
                        )}
                      </Button>
                    );
                  }
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Rest */}
          <ActionButton
            icon={<Moon className="h-5 w-5 text-indigo-500" />}
            label="Rest"
            onClick={() => handleAction(restPet)}
            disabled={pet.energy > 95}
            disabledReason={restDisabledReason}
          />

          {/* Clean */}
          <ActionButton
            icon={<Sparkles className="h-5 w-5 text-cyan-500" />}
            label="Clean"
            onClick={() => handleAction(cleanPet)}
            cost={CLEANING_COST}
            disabled={pet.cleanliness > 95 || balance < CLEANING_COST}
            disabledReason={cleanDisabledReason}
          />

          {/* Vet */}
          <ActionButton
            icon={<Stethoscope className="h-5 w-5 text-green-500" />}
            label="Vet"
            onClick={() => handleAction(vetVisit)}
            cost={VET_COST}
            disabled={pet.health > 95 || balance < VET_COST}
            disabledReason={vetDisabledReason}
          />
        </div>

        {playDisabledReason && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Your pet is too tired to play. Let them rest first!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
