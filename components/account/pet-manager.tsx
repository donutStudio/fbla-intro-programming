"use client";

import { useMemo, useState } from "react";
import { useAccountStore } from "@/lib/account-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PawPrint, PlusCircle, Trash2 } from "lucide-react";

export function PetManager() {
  const currentUserId = useAccountStore((state) => state.currentUserId);
  const account = useAccountStore((state) =>
    currentUserId ? state.accounts[currentUserId] : null
  );
  const selectPet = useAccountStore((state) => state.selectPet);
  const renamePet = useAccountStore((state) => state.renamePet);
  const deletePet = useAccountStore((state) => state.deletePet);
  const startPetCreation = useAccountStore((state) => state.startPetCreation);

  const [renameValues, setRenameValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  const pets = useMemo(() => account?.pets ?? [], [account?.pets]);

  if (!account) return null;

  const handleRename = (petId: string) => {
    const value = renameValues[petId] ?? "";
    const result = renamePet(petId, value);
    setMessage(result.message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
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
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="rounded-xl border border-border/60 p-4 bg-card/70 transition hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{pet.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {pet.type} · Created {new Date(pet.createdAt).toLocaleDateString()}
                    </p>
                    {account.activePetId === pet.id && (
                      <Badge variant="secondary" className="mt-2">
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => selectPet(pet.id)}>
                      Play
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deletePet(pet.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Rename pet"
                    value={renameValues[pet.id] ?? ""}
                    onChange={(event) =>
                      setRenameValues((prev) => ({
                        ...prev,
                        [pet.id]: event.target.value,
                      }))
                    }
                  />
                  <Button variant="outline" onClick={() => handleRename(pet.id)}>
                    Rename
                  </Button>
                </div>
              </div>
            ))}
            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
