"use client";

import { useMemo, useState } from "react";
import { usePetStore, type PetType } from "@/lib/pet-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PawPrint, Sparkles } from "lucide-react";

const PET_OPTIONS: {
  type: PetType;
  emoji: string;
  name: string;
  description: string;
}[] = [
  { type: "cat", emoji: "🐱", name: "Cat", description: "Independent and playful" },
  { type: "dog", emoji: "🐶", name: "Dog", description: "Loyal and energetic" },
  { type: "bunny", emoji: "🐰", name: "Bunny", description: "Gentle and cuddly" },
  { type: "hamster", emoji: "🐹", name: "Hamster", description: "Small and active" },
];

export function SetupScreen() {
  const [petName, setPetName] = useState("");
  const [selectedType, setSelectedType] = useState<PetType | null>(null);
  const [step, setStep] = useState(1);
  const createPet = usePetStore((state) => state.createPet);
  const demoMode = usePetStore((state) => state.demoMode);
  const setDemoMode = usePetStore((state) => state.setDemoMode);

  const nameErrors = useMemo(() => {
    const errors: string[] = [];
    const trimmed = petName.trim();
    if (!trimmed) errors.push("Name is required.");
    if (trimmed.length > 20) errors.push("Name must be 20 characters or less.");
    return errors;
  }, [petName]);

  const typeErrors = useMemo(() => {
    return selectedType ? [] : ["Please choose a pet type."];
  }, [selectedType]);

  const handleCreate = () => {
    if (nameErrors.length === 0 && selectedType) {
      createPet(petName.trim(), selectedType);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary/30 to-background">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4">
            <PawPrint className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">PetPal</h1>
          <p className="text-muted-foreground">Your virtual companion awaits!</p>
        </div>

        {/* Step 1: Choose Pet Type */}
        {step === 1 && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                  1
                </span>
                Choose Your Pet
              </CardTitle>
              <CardDescription>
                Select the type of virtual friend you want to care for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {PET_OPTIONS.map((pet) => (
                  <button
                    key={pet.type}
                    type="button"
                    onClick={() => setSelectedType(pet.type)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                      selectedType === pet.type
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    <span className="text-5xl block mb-2">{pet.emoji}</span>
                    <p className="font-medium text-foreground">{pet.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {pet.description}
                    </p>
                  </button>
                ))}
              </div>
              {typeErrors.length > 0 && (
                <div className="text-xs text-red-500 space-y-1">
                  {typeErrors.map((error) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-foreground">Demo Mode</p>
                  <p className="text-xs text-muted-foreground">
                    Speed up time for presentations
                  </p>
                </div>
                <Switch checked={demoMode} onCheckedChange={setDemoMode} />
              </div>
              <Button
                className="w-full"
                size="lg"
                disabled={!selectedType}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Name Your Pet */}
        {step === 2 && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                  2
                </span>
                Name Your Pet
              </CardTitle>
              <CardDescription>
                Give your{" "}
                {PET_OPTIONS.find((p) => p.type === selectedType)?.name.toLowerCase()}
                {" "}a special name
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <span className="text-8xl animate-bounce-soft">
                    {PET_OPTIONS.find((p) => p.type === selectedType)?.emoji}
                  </span>
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="h-6 w-6 text-primary animate-sparkle" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="petName">Pet Name</Label>
                  <Input
                    id="petName"
                    placeholder="Enter a name..."
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="text-center text-lg"
                    maxLength={20}
                  />
                  {nameErrors.length > 0 && (
                    <div className="text-xs text-red-500 space-y-1">
                      {nameErrors.length > 1 && <p>Please fix the following:</p>}
                      {nameErrors.map((error) => (
                        <p key={error}>{error}</p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    size="lg"
                    disabled={nameErrors.length > 0}
                    onClick={handleCreate}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start Adventure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center animate-in fade-in duration-1000 delay-300">
          <div className="p-3">
            <div className="text-2xl mb-1">🍎</div>
            <p className="text-xs text-muted-foreground">Feed & Care</p>
          </div>
          <div className="p-3">
            <div className="text-2xl mb-1">💰</div>
            <p className="text-xs text-muted-foreground">Manage Budget</p>
          </div>
          <div className="p-3">
            <div className="text-2xl mb-1">🎯</div>
            <p className="text-xs text-muted-foreground">Earn Rewards</p>
          </div>
        </div>
      </div>
    </div>
  );
}
