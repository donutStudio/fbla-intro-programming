"use client";

import { useState, useEffect } from "react";
import { usePetStore } from "@/lib/pet-store";
import { PetAvatar } from "./pet-avatar";
import { PetStats } from "./pet-stats";
import { PetActions } from "./pet-actions";
import { FinancePanel } from "./finance-panel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PawPrint, Wallet, Activity, RotateCcw, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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

  // Update pet stats periodically
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
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-foreground">PetPal</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="font-bold text-foreground">${balance}</span>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Dynamic Avatar</span>
              <Switch
                checked={avatarMode === "dynamic"}
                onCheckedChange={(checked) =>
                  setAvatarMode(checked ? "dynamic" : "emoji")
                }
              />
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Demo Mode</span>
              <Switch checked={demoMode} onCheckedChange={setDemoMode} />
            </div>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    Finance
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span>Dynamic Avatar</span>
                    <Switch
                      checked={avatarMode === "dynamic"}
                      onCheckedChange={(checked) =>
                        setAvatarMode(checked ? "dynamic" : "emoji")
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span>Demo Mode</span>
                    <Switch checked={demoMode} onCheckedChange={setDemoMode} />
                  </div>
                  <FinancePanel />
                </div>
              </SheetContent>
            </Sheet>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Game?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete your current pet and all progress. This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={resetGame}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Pet & Actions (Mobile: Full width) */}
          <div className="md:col-span-2 space-y-6">
            {/* Pet Avatar Card */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border">
              <PetAvatar isInteracting={isInteracting} />
            </div>

            {/* Tabs for Mobile */}
            <div className="md:hidden">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="care" className="gap-2">
                    <Activity className="h-4 w-4" />
                    Care
                  </TabsTrigger>
                  <TabsTrigger value="finance" className="gap-2">
                    <Wallet className="h-4 w-4" />
                    Finance
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="care" className="mt-4 space-y-4">
                  <PetStats />
                  <PetActions onInteraction={handleInteraction} />
                </TabsContent>
                <TabsContent value="finance" className="mt-4">
                  <FinancePanel />
                </TabsContent>
              </Tabs>
            </div>

            {/* Desktop Stats & Actions */}
            <div className="hidden md:grid md:grid-cols-2 gap-4">
              <PetStats />
              <PetActions onInteraction={handleInteraction} />
            </div>
          </div>

          {/* Right Column - Finance (Desktop only) */}
          <div className="hidden md:block">
            <div className="sticky top-24">
              <FinancePanel />
            </div>
          </div>
        </div>
      </main>

      {/* Help Tips */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-sm mb-2 text-foreground">Tips</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Keep all stats above 30% to maintain a happy pet</li>
            <li>• Complete tasks to earn money for pet care</li>
            <li>• Playing with toys might teach your pet new tricks!</li>
            <li>• Visit the vet when your pet&apos;s health is low</li>
            <li>• Your pet evolves from baby to teen to adult over time</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
