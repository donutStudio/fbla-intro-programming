import type { AvatarMode } from "@/lib/pet-store";
import { Button } from "@/components/ui/button";
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
import { PawPrint, Wallet, RotateCcw, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FinancePanel } from "./finance-panel";

type GameHeaderProps = {
  balance: number;
  avatarMode: AvatarMode;
  onAvatarModeChange: (mode: AvatarMode) => void;
  demoMode: boolean;
  onToggleDemoMode: (enabled: boolean) => void;
  onReset: () => void;
  username?: string | null;
  onLogout: () => void;
  onManagePets: () => void;
  onManageFriends: () => void;
};

export function GameHeader({
  balance,
  avatarMode,
  onAvatarModeChange,
  demoMode,
  onToggleDemoMode,
  onReset,
  username,
  onLogout,
  onManagePets,
  onManageFriends,
}: GameHeaderProps) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PawPrint className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg text-foreground">PetPal</span>
        </div>

        <div className="flex items-center gap-4">
          {username && (
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{username}</span>
              <Button variant="outline" size="sm" onClick={onManagePets}>
                My Pets
              </Button>
              <Button variant="outline" size="sm" onClick={onManageFriends}>
                Friends
              </Button>
              <Button variant="outline" size="sm" onClick={onLogout}>
                Log out
              </Button>
            </div>
          )}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="font-bold text-foreground">${balance}</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Dynamic Avatar</span>
            <Switch
              checked={avatarMode === "dynamic"}
              onCheckedChange={(checked) =>
                onAvatarModeChange(checked ? "dynamic" : "emoji")
              }
            />
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Demo Mode</span>
            <Switch checked={demoMode} onCheckedChange={onToggleDemoMode} />
          </div>

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
                {username && (
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span>Signed in as</span>
                    <span className="font-semibold">{username}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm mb-4">
                  <span>Dynamic Avatar</span>
                  <Switch
                    checked={avatarMode === "dynamic"}
                    onCheckedChange={(checked) =>
                      onAvatarModeChange(checked ? "dynamic" : "emoji")
                    }
                  />
                </div>
                <div className="flex items-center justify-between text-sm mb-4">
                  <span>Demo Mode</span>
                  <Switch checked={demoMode} onCheckedChange={onToggleDemoMode} />
                </div>
                {username && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mb-2"
                    onClick={onManagePets}
                  >
                    My Pets
                  </Button>
                )}
                {username && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mb-2"
                    onClick={onManageFriends}
                  >
                    Friends
                  </Button>
                )}
                {username && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mb-4"
                    onClick={onLogout}
                  >
                    Log out
                  </Button>
                )}
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
                  This will delete your current pet and all progress. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onReset}
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
  );
}
