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
import { PawPrint, Wallet, RotateCcw } from "lucide-react";

type GameHeaderProps = {
  balance: number;
  avatarMode: AvatarMode;
  onAvatarModeChange: (mode: AvatarMode) => void;
  demoMode: boolean;
  onToggleDemoMode: (enabled: boolean) => void;
  onReset: () => void;
};

export function GameHeader({
  balance,
  avatarMode,
  onAvatarModeChange,
  demoMode,
  onToggleDemoMode,
  onReset,
}: GameHeaderProps) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PawPrint className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg text-foreground">PetPal Alpha</span>
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
                onAvatarModeChange(checked ? "dynamic" : "emoji")
              }
            />
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Demo Mode</span>
            <Switch checked={demoMode} onCheckedChange={onToggleDemoMode} />
          </div>

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
                  This will delete your current pet and all progress.
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
