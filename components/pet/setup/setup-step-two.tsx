import type { Dispatch, SetStateAction } from "react";
import type { PetAppearance, PetType } from "@/lib/pet-store";
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
import { Sparkles } from "lucide-react";
import { APPEARANCE_OPTIONS, PET_OPTIONS } from "./pet-options";

type SetupStepTwoProps = {
  petName: string;
  onPetNameChange: (value: string) => void;
  selectedType: PetType | null;
  avatarMode: "dynamic" | "emoji";
  onAvatarModeChange: (mode: "dynamic" | "emoji") => void;
  demoMode: boolean;
  onToggleDemoMode: (enabled: boolean) => void;
  appearance: PetAppearance;
  onAppearanceChange: Dispatch<SetStateAction<PetAppearance>>;
  onBack: () => void;
  onSubmit: () => void;
};

export function SetupStepTwo({
  petName,
  onPetNameChange,
  selectedType,
  avatarMode,
  onAvatarModeChange,
  demoMode,
  onToggleDemoMode,
  appearance,
  onAppearanceChange,
  onBack,
  onSubmit,
}: SetupStepTwoProps) {
  const selectedPet = PET_OPTIONS.find((pet) => pet.type === selectedType);

  const updateAppearance = <K extends keyof PetAppearance>(
    key: K,
    value: PetAppearance[K]
  ) =>
    onAppearanceChange((prev) => ({
      ...prev,
      [key]: value,
    }));

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
            2
          </span>
          Name Your Pet
        </CardTitle>
        <CardDescription>
          Give your {selectedPet?.name.toLowerCase()} a special name
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-6">
          <div className="relative">
            <span className="text-8xl animate-bounce-soft">{selectedPet?.emoji}</span>
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
              onChange={(e) => onPetNameChange(e.target.value)}
              className="text-center text-lg"
              maxLength={20}
            />
          </div>

          <div className="rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Avatar Style</p>
                <p className="text-xs text-muted-foreground">
                  Use emoji mode, or dynamic mode with tint + layered accessories
                </p>
              </div>
              <Switch
                checked={avatarMode === "dynamic"}
                onCheckedChange={(checked) =>
                  onAvatarModeChange(checked ? "dynamic" : "emoji")
                }
              />
            </div>
          </div>

          <div className="rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Demo Mode</p>
                <p className="text-xs text-muted-foreground">
                  Speed up stat decay for presentations
                </p>
              </div>
              <Switch checked={demoMode} onCheckedChange={onToggleDemoMode} />
            </div>
          </div>

          {avatarMode === "dynamic" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Tint color</Label>
                <div className="flex flex-wrap gap-2">
                  {APPEARANCE_OPTIONS.color.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs",
                        appearance.color === option.key
                          ? "border-primary bg-primary/10"
                          : "border-border"
                      )}
                      onClick={() => updateAppearance("color", option.key)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={onBack}>
              Back
            </Button>
            <Button className="flex-1" size="lg" disabled={!petName.trim()} onClick={onSubmit}>
              <Sparkles className="mr-2 h-4 w-4" />
              Start Adventure
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
