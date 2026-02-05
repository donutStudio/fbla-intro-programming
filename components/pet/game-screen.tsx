"use client";

import { useState, useEffect } from "react";
import { usePetStore } from "@/lib/pet-store";
import { GameHeader } from "./game-header";
import { GameTabs } from "./game-tabs";

export function GameScreen() {
  const {
    pet,
    updatePetStats,
    resetGame,
    balance,
    avatarMode,
    setAvatarMode,
    demoMode,
    setDemoMode,
  } = usePetStore();
  const [isInteracting, setIsInteracting] = useState(false);
  const [activeTab, setActiveTab] = useState("care");

  useEffect(() => {
    updatePetStats();
    const interval = setInterval(updatePetStats, demoMode ? 10000 : 60000);
    return () => clearInterval(interval);
  }, [updatePetStats, demoMode]);

  const handleInteraction = () => {
    setIsInteracting(true);
    setTimeout(() => setIsInteracting(false), 1500);
  };

  if (!pet) return null;

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
        <GameTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isInteracting={isInteracting}
          onInteraction={handleInteraction}
        />
      </main>
    </div>
  );
}
