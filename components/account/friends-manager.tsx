"use client";

import { FriendsPanel } from "@/components/pet/friends-panel";
import { Button } from "@/components/ui/button";
import { useAccountStore } from "@/lib/account-store";
import { Users } from "lucide-react";

export function FriendsManager() {
  const showManager = useAccountStore((state) => state.showManager);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Users className="h-5 w-5 text-primary" />
            Friends
          </div>
          <Button variant="outline" onClick={showManager}>
            My Pets
          </Button>
        </div>
        <FriendsPanel />
      </div>
    </div>
  );
}
