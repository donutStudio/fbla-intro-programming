"use client";

import { useState, useEffect } from "react";
import { usePetStore } from "@/lib/pet-store";
import { PetAvatar } from "./pet-avatar";
import { PetStats } from "./pet-stats";
import { PetActions } from "./pet-actions";
import { FinancePanel } from "./finance-panel";
import { PetInsights } from "./pet-insights";
import { AnalyticsDashboard } from "./analytics-dashboard";
import { HelpPanel } from "./help-panel";
import { AskPetPal } from "./ask-petpal";
import { AboutPanel } from "./about-panel";
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
import {
  PawPrint,
  Wallet,
  Activity,
  RotateCcw,
  Menu,
  BarChart3,
  MessageSquare,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function GameScreen() {
  const { pet, updatePetStats, resetGame, balance, avatarMode, setAvatarMode } =
    usePetStore();
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
                    Finance + Settings
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full flex flex-wrap justify-start gap-2">
            <TabsTrigger value="care" className="gap-2">
              <Activity className="h-4 w-4" />
              Care
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="ask" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Ask PetPal
            </TabsTrigger>
            <TabsTrigger value="help" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              Help
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-2">
              <Sparkles className="h-4 w-4" />
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="care" className="mt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border">
                  <PetAvatar isInteracting={isInteracting} />
                </div>
                <div className="grid lg:grid-cols-2 gap-4">
                  <PetStats />
                  <PetActions onInteraction={handleInteraction} />
                  <PetInsights />
                </div>
              </div>

              <div className="hidden md:block">
                <div className="sticky top-24">
                  <FinancePanel />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="ask" className="mt-6">
            <AskPetPal />
          </TabsContent>

          <TabsContent value="help" className="mt-6">
            <HelpPanel />
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <AboutPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
