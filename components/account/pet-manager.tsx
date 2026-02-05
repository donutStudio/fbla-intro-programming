"use client";

import { useMemo, useState } from "react";
import { useAccountStore } from "@/lib/account-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MoreHorizontal,
  PawPrint,
  PlusCircle,
  Trash2,
  Users,
} from "lucide-react";

const PET_EMOJIS: Record<string, string> = {
  cat: "🐱",
  dog: "🐶",
  bunny: "🐰",
  hamster: "🐹",
};

export function PetManager() {
  const currentUserId = useAccountStore((state) => state.currentUserId);
  const account = useAccountStore((state) =>
    currentUserId ? state.accounts[currentUserId] : null
  );
  const selectPet = useAccountStore((state) => state.selectPet);
  const renamePet = useAccountStore((state) => state.renamePet);
  const deletePet = useAccountStore((state) => state.deletePet);
  const startPetCreation = useAccountStore((state) => state.startPetCreation);
  const setPetAccess = useAccountStore((state) => state.setPetAccess);

  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [accessTarget, setAccessTarget] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const pets = useMemo(() => account?.pets ?? [], [account?.pets]);

  if (!account) return null;

  const handleRename = () => {
    if (!renameTarget) return;
    const result = renamePet(renameTarget, renameValue);
    setMessage(result.message);
    if (result.ok) {
      setRenameTarget(null);
      setRenameValue("");
    }
  };

  const activePet = pets.find((pet) => pet.id === account.activePetId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="shadow-sm border border-border/70 animate-in fade-in slide-in-from-top-4 duration-500">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <PawPrint className="h-5 w-5 text-primary" />
              Your Pets
            </CardTitle>
            <Button onClick={startPetCreation}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add new pet
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {pets.length === 0 && (
              <div className="text-sm text-muted-foreground">
                You don’t have any pets yet. Create one to get started.
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pets.map((pet) => {
                const emoji = PET_EMOJIS[pet.type] ?? "🐾";
                const isActive = account.activePetId === pet.id;
                return (
                  <div
                    key={pet.id}
                    className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-4xl">{emoji}</div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setRenameTarget(pet.id);
                              setRenameValue(pet.name);
                            }}
                          >
                            Rename
                          </DropdownMenuItem>
                          {!pet.isShared && (
                            <DropdownMenuItem onClick={() => setAccessTarget(pet.id)}>
                              Manage access
                            </DropdownMenuItem>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this pet?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove the pet and its progress from your account.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deletePet(pet.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{pet.name}</p>
                        {pet.isShared && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Friend
                          </Badge>
                        )}
                        {isActive && (
                          <Badge variant="secondary" className="ml-auto">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {pet.type}
                        {pet.isShared ? " · Shared" : ""}
                      </p>
                    </div>

                    <Button
                      className="mt-4 w-full"
                      size="sm"
                      onClick={() => selectPet(pet.id)}
                      disabled={isActive && activePet?.id === pet.id}
                    >
                      {isActive ? "Playing" : "Play"}
                    </Button>
                  </div>
                );
              })}
            </div>
            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!renameTarget} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename pet</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              placeholder="New name"
            />
            <Button onClick={handleRename}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!accessTarget} onOpenChange={(open) => !open && setAccessTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage access</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {account.friends.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Add friends first to share access.
              </p>
            )}
            {account.friends.map((friendId) => {
              const friendAccount = useAccountStore
                .getState()
                .accounts[friendId];
              const friendName = friendAccount?.username ?? "Friend";
              const pet = account.pets.find((p) => p.id === accessTarget);
              const currentAccess = pet?.sharedWith?.[friendId] ?? "none";

              return (
                <div
                  key={friendId}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3"
                >
                  <div className="text-sm font-medium text-foreground">
                    {friendName}
                  </div>
                  <Select
                    value={currentAccess}
                    onValueChange={(value) =>
                      setPetAccess(accessTarget as string, friendId, value as "view" | "edit" | "none")
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Access" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No access</SelectItem>
                      <SelectItem value="view">View only</SelectItem>
                      <SelectItem value="edit">View + edit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
