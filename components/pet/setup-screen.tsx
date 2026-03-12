"use client";

import { useState } from "react";
import {
  usePetStore,
  type PetType,
  type PetAppearance,
} from "@/lib/pet-store";
import { PawPrint } from "lucide-react";
import { SetupStepOne } from "./setup/setup-step-one";
import { SetupStepTwo } from "./setup/setup-step-two";
import { useAccountStore } from "@/lib/account-store";
import { Button } from "@/components/ui/button";

type SetupScreenProps = {
  showSkip?: boolean;
  onSkip?: () => void;
};

export function SetupScreen({ showSkip = false, onSkip }: SetupScreenProps) {
  const [petName, setPetName] = useState("");
  const [selectedType, setSelectedType] = useState<PetType | null>(null);
  const [step, setStep] = useState(1);
  const [appearance, setAppearance] = useState<PetAppearance>({
    color: "#ff6fa1",
    eyeStyle: "round",
    accessory: "none",
    wingStyle: "none",
    layerIds: [],
  });
  const createPet = usePetStore((state) => state.createPet);
  const avatarMode = usePetStore((state) => state.avatarMode);
  const setAvatarMode = usePetStore((state) => state.setAvatarMode);
  const demoMode = usePetStore((state) => state.demoMode);
  const setDemoMode = usePetStore((state) => state.setDemoMode);
  const addPetFromSnapshot = useAccountStore(
    (state) => state.addPetFromSnapshot
  );

  const handleCreate = () => {
    if (petName.trim() && selectedType) {
      createPet(petName.trim(), selectedType, appearance);
      addPetFromSnapshot(usePetStore.getState().getSnapshot());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary/30 to-background">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4">
            <PawPrint className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">PetPal</h1>
          <p className="text-muted-foreground">Your virtual companion awaits!</p>
        </div>

        {step === 1 && (
          <SetupStepOne
            selectedType={selectedType}
            onSelectType={setSelectedType}
            demoMode={demoMode}
            onToggleDemoMode={setDemoMode}
            onContinue={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <SetupStepTwo
            petName={petName}
            onPetNameChange={setPetName}
            selectedType={selectedType}
            avatarMode={avatarMode}
            onAvatarModeChange={setAvatarMode}
            demoMode={demoMode}
            onToggleDemoMode={setDemoMode}
            appearance={appearance}
            onAppearanceChange={setAppearance}
            onBack={() => setStep(1)}
            onSubmit={handleCreate}
          />
        )}

        {showSkip && (
          <div className="mt-6 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSkip?.()}
            >
              Skip for now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
