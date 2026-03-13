"use client";

import { useEffect, useState } from "react";
import { usePetStore } from "@/lib/pet-store";
import { GameHeader } from "./game-header";
import { CareTab } from "./care-tab";
import { Button } from "@/components/ui/button";

type GameScreenProps = {
  gameStarted: boolean;
};

export function GameScreen({ gameStarted }: GameScreenProps) {
  const {
    pet,
    createPet,
    updatePetStats,
    resetGame,
    balance,
    avatarMode,
    setAvatarMode,
    demoMode,
    setDemoMode,
  } = usePetStore();

  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    if (!gameStarted || !pet) return;

    updatePetStats();
    const interval = setInterval(updatePetStats, demoMode ? 10000 : 45000);
    return () => clearInterval(interval);
  }, [gameStarted, pet, updatePetStats, demoMode]);

  const handleInteraction = () => {
    setIsInteracting(true);
    setTimeout(() => setIsInteracting(false), 1500);
  };

  const handleStart = () => {
    createPet("Buddy", "dog", {
      color: "#ff6fa1",
      eyeStyle: "round",
      accessory: "none",
      wingStyle: "none",
      layerIds: [],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <GameHeader
        balance={balance}
        avatarMode={avatarMode}
        onAvatarModeChange={setAvatarMode}
        demoMode={demoMode}
        onToggleDemoMode={setDemoMode}
        onReset={resetGame}
      />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {!gameStarted || !pet ? (
          <div className="bg-card rounded-2xl p-10 shadow-sm border border-border text-center space-y-4">
            <h1 className="text-3xl font-bold">PetPal Alpha</h1>
            <p className="text-muted-foreground">
              Super early build. One pet. One screen. Feed your pet.
            </p>
            <Button onClick={handleStart}>Start</Button>
          </div>
        ) : (
          <CareTab isInteracting={isInteracting} onInteraction={handleInteraction} />
        )}
      </main>
    </div>
  );
}
