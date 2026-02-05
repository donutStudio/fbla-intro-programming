import type { PetType } from "@/lib/pet-store";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PET_OPTIONS } from "./pet-options";

type SetupStepOneProps = {
  selectedType: PetType | null;
  onSelectType: (type: PetType) => void;
  demoMode: boolean;
  onToggleDemoMode: (enabled: boolean) => void;
  onContinue: () => void;
};

export function SetupStepOne({
  selectedType,
  onSelectType,
  demoMode,
  onToggleDemoMode,
  onContinue,
}: SetupStepOneProps) {
  return (
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
              onClick={() => onSelectType(pet.type)}
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
        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="font-medium text-foreground">Demo Mode</p>
            <p className="text-xs text-muted-foreground">
              Speed up time for presentations
            </p>
          </div>
          <Switch checked={demoMode} onCheckedChange={onToggleDemoMode} />
        </div>
        <Button
          className="w-full"
          size="lg"
          disabled={!selectedType}
          onClick={onContinue}
        >
          Continue
        </Button>
      </CardContent>
    </Card>
  );
}
