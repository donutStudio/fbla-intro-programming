"use client";

import { usePetStore } from "@/lib/pet-store";
import { GameScreen } from "@/components/pet/game-screen";
import { useEffect, useState } from "react";

export default function Home() {
  const gameStarted = usePetStore((state) => state.gameStarted);
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
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <GameScreen gameStarted={gameStarted} />;
}
