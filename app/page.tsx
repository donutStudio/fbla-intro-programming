"use client";

import { usePetStore } from "@/lib/pet-store";
import { SetupScreen } from "@/components/pet/setup-screen";
import { GameScreen } from "@/components/pet/game-screen";
import { AuthScreen } from "@/components/account/auth-screen";
import { AccountSync } from "@/components/account/account-sync";
import { PetManager } from "@/components/account/pet-manager";
import { FriendsManager } from "@/components/account/friends-manager";
import { useAccountStore } from "@/lib/account-store";
import { useEffect, useState } from "react";

export default function Home() {
  // Pull scoped slices from Zustand to avoid broad rerenders in the shell component.
  const gameStarted = usePetStore((state) => state.gameStarted);
  const currentUserId = useAccountStore((state) => state.currentUserId);
  const account = useAccountStore((state) =>
    currentUserId ? state.accounts[currentUserId] : null
  );
  const showPetManager = useAccountStore((state) => state.showPetManager);
  const showSetup = useAccountStore((state) => state.showSetup);
  const showFriendsManager = useAccountStore(
    (state) => state.showFriendsManager
  );
  const completeOnboarding = useAccountStore((state) => state.completeOnboarding);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Wait until the client mounts before checking persisted store state.
    setMounted(true);
    // console.debug("Home mounted");
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

  // Auth gate: nothing else should render until we know the active account.
  if (!currentUserId) {
    return <AuthScreen />;
  }

  if (showSetup) {
    // Let brand-new users skip onboarding if they have no pets yet.
    const showSkip =
      !!account && !account.hasCompletedOnboarding && account.pets.length === 0;
    return (
      <>
        <AccountSync />
        <SetupScreen showSkip={showSkip} onSkip={completeOnboarding} />
      </>
    );
  }

  // Route to account-level views before entering the active pet gameplay flow.
  if (showFriendsManager) {
    return (
      <>
        <AccountSync />
        <FriendsManager />
      </>
    );
  }

  if (showPetManager || !account?.activePetId) {
    // Fall back to manager when there is no currently selected pet.
    return (
      <>
        <AccountSync />
        <PetManager />
      </>
    );
  }

  // Normal path: keep account state synced while switching between setup and game.
  return (
    <>
      <AccountSync />
      {gameStarted ? <GameScreen /> : <SetupScreen />}
    </>
  );
}
