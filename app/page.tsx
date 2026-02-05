"use client";

import { usePetStore } from "@/lib/pet-store";
import { SetupScreen } from "@/components/pet/setup-screen";
import { GameScreen } from "@/components/pet/game-screen";
import { AuthScreen } from "@/components/account/auth-screen";
import { AccountSync } from "@/components/account/account-sync";
import { useAccountStore } from "@/lib/account-store";
import { useEffect, useState } from "react";

export default function Home() {
  const gameStarted = usePetStore((state) => state.gameStarted);
  const currentUserId = useAccountStore((state) => state.currentUserId);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background">
        <div className="animate-pulse text-center">
          <div className="text-6xl mb-4">🐾</div>
          <p className="text-muted-foreground">Loading PetPal...</p>
        </div>
      </div>
    );
  }

  if (!currentUserId) {
    return <AuthScreen />;
  }

  return (
    <>
      <AccountSync />
      {gameStarted ? <GameScreen /> : <SetupScreen />}
    </>
  );
}
