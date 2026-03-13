"use client";

import { useState, useEffect } from "react";
import { usePetStore } from "@/lib/pet-store";
import { useAccountStore } from "@/lib/account-store";
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
  const currentUserId = useAccountStore((state) => state.currentUserId);
  const currentUser = useAccountStore((state) =>
    currentUserId ? state.accounts[currentUserId] : null
  );
  const logout = useAccountStore((state) => state.logout);
  const showManager = useAccountStore((state) => state.showManager);
  const showFriends = useAccountStore((state) => state.showFriends);
  // This flag is only for transient visual state (animations/highlights).
  const [isInteracting, setIsInteracting] = useState(false);
  const [activeTab, setActiveTab] = useState("care");

  useEffect(() => {
    // Refresh once immediately, then continue on a steady interval.
    updatePetStats();
    // Demo mode ticks faster so stat decay/recovery changes are easier to observe.
    const interval = setInterval(updatePetStats, demoMode ? 10000 : 45000);
    return () => clearInterval(interval);
  }, [updatePetStats, demoMode]);

  const handleInteraction = () => {
    // Short-lived flag used for UI animation feedback.
    setIsInteracting(true);
    setTimeout(() => setIsInteracting(false), 1500);
    // setTimeout(() => setIsInteracting(false), 800); // used while tuning animation speed
  };

  // Guard against a brief render while pet data is being initialized/restored.
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
        username={currentUser?.username}
        onLogout={logout}
        onManagePets={showManager}
        onManageFriends={showFriends}
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
