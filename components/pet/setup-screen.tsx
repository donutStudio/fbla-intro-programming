"use client";

import { useState } from "react";
import {
  usePetStore,
  type PetType,
  type PetAppearance,
} from "@/lib/pet-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  const [appearance, setAppearance] = useState<PetAppearance>({
    color: "golden",
    pattern: "solid",
    accessory: "none",
    primaryTrait: "wings",
    secondaryTrait: "none",
  });
  const createPet = usePetStore((state) => state.createPet);
  const avatarMode = usePetStore((state) => state.avatarMode);
  const setAvatarMode = usePetStore((state) => state.setAvatarMode);
  const demoMode = usePetStore((state) => state.demoMode);
  const setDemoMode = usePetStore((state) => state.setDemoMode);

  const handleCreate = () => {
    if (petName.trim() && selectedType) {
      createPet(petName.trim(), selectedType, appearance);
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
                  </div>

                  <div className="rounded-xl border border-border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Avatar Style
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Switch between dynamic art and classic emoji mode
                        </p>
                      </div>
                      <Switch
                        checked={avatarMode === "dynamic"}
                        onCheckedChange={(checked) =>
                          setAvatarMode(checked ? "dynamic" : "emoji")
                        }
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Demo Mode
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Speed up stat decay for presentations
                        </p>
                      </div>
                      <Switch
                        checked={demoMode}
                        onCheckedChange={setDemoMode}
                      />
                    </div>
                  </div>

                  {avatarMode === "dynamic" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Fur color</Label>
                        <div className="flex flex-wrap gap-2">
                          {(
                            [
                              { key: "charcoal", label: "Charcoal" },
                              { key: "golden", label: "Golden" },
                              { key: "cream", label: "Cream" },
                              { key: "sky", label: "Sky" },
                              { key: "rose", label: "Rose" },
                            ] as Array<{ key: PetAppearance["color"]; label: string }>
                          ).map((option) => (
                            <button
                              key={option.key}
                              type="button"
                              className={cn(
                                "rounded-full border px-3 py-1 text-xs",
                                appearance.color === option.key
                                  ? "border-primary bg-primary/10"
                                  : "border-border"
                              )}
                              onClick={() =>
                                setAppearance((prev) => ({
                                  ...prev,
                                  color: option.key,
                                }))
                              }
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Pattern</Label>
                        <div className="flex flex-wrap gap-2">
                          {(
                            [
                              { key: "solid", label: "Solid" },
                              { key: "spots", label: "Spots" },
                              { key: "stripes", label: "Stripes" },
                              { key: "patches", label: "Patches" },
                            ] as Array<{ key: PetAppearance["pattern"]; label: string }>
                          ).map((option) => (
                            <button
                              key={option.key}
                              type="button"
                              className={cn(
                                "rounded-full border px-3 py-1 text-xs",
                                appearance.pattern === option.key
                                  ? "border-primary bg-primary/10"
                                  : "border-border"
                              )}
                              onClick={() =>
                                setAppearance((prev) => ({
                                  ...prev,
                                  pattern: option.key,
                                }))
                              }
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Accessory</Label>
                        <div className="flex flex-wrap gap-2">
                          {(
                            [
                              { key: "none", label: "None" },
                              { key: "bow", label: "Bow" },
                              { key: "collar", label: "Collar" },
                              { key: "hat", label: "Hat" },
                              { key: "bandana", label: "Bandana" },
                            ] as Array<{ key: PetAppearance["accessory"]; label: string }>
                          ).map((option) => (
                            <button
                              key={option.key}
                              type="button"
                              className={cn(
                                "rounded-full border px-3 py-1 text-xs",
                                appearance.accessory === option.key
                                  ? "border-primary bg-primary/10"
                                  : "border-border"
                              )}
                              onClick={() =>
                                setAppearance((prev) => ({
                                  ...prev,
                                  accessory: option.key,
                                }))
                              }
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Primary evolution trait (shows from teen)
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {(
                            [
                              { key: "wings", label: "Wings" },
                              { key: "crown", label: "Crown" },
                              { key: "cape", label: "Cape" },
                              { key: "horns", label: "Horns" },
                              { key: "backpack", label: "Backpack" },
                              { key: "sparkles", label: "Sparkles" },
                              { key: "none", label: "None" },
                            ] as Array<{ key: PetAppearance["primaryTrait"]; label: string }>
                          ).map((option) => (
                            <button
                              key={option.key}
                              type="button"
                              className={cn(
                                "rounded-full border px-3 py-1 text-xs",
                                appearance.primaryTrait === option.key
                                  ? "border-primary bg-primary/10"
                                  : "border-border"
                              )}
                              onClick={() =>
                                setAppearance((prev) => ({
                                  ...prev,
                                  primaryTrait: option.key,
                                }))
                              }
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Secondary trait (adult bonus)
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {(
                            [
                              { key: "none", label: "None" },
                              { key: "wings", label: "Wings" },
                              { key: "crown", label: "Crown" },
                              { key: "cape", label: "Cape" },
                              { key: "horns", label: "Horns" },
                              { key: "backpack", label: "Backpack" },
                              { key: "sparkles", label: "Sparkles" },
                            ] as Array<{ key: PetAppearance["secondaryTrait"]; label: string }>
                          ).map((option) => (
                            <button
                              key={option.key}
                              type="button"
                              className={cn(
                                "rounded-full border px-3 py-1 text-xs",
                                appearance.secondaryTrait === option.key
                                  ? "border-primary bg-primary/10"
                                  : "border-border"
                              )}
                              onClick={() =>
                                setAppearance((prev) => ({
                                  ...prev,
                                  secondaryTrait: option.key,
                                }))
                              }
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

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
