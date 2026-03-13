"use client";

import { usePetStore } from "@/lib/pet-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils } from "lucide-react";
import { toast } from "sonner";

interface PetActionsProps {
  onInteraction: () => void;
}

export function PetActions({ onInteraction }: PetActionsProps) {
  const { feedPet } = usePetStore();

  const handleFeed = () => {
    const result = feedPet("basic");
    if (result.ok) {
      toast.success(result.message);
      onInteraction();
      return;
    }

    toast.error(result.message);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Utensils className="h-5 w-5 text-amber-500" />
          Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          variant="secondary"
          className="h-auto w-full flex-col gap-1 p-5 transition-all hover:scale-105 active:scale-95"
          onClick={handleFeed}
        >
          <Utensils className="h-6 w-6 text-amber-500" />
          <span className="text-sm font-medium">Feed Pet</span>
          <span className="text-xs text-muted-foreground">Basic food only</span>
        </Button>
      </CardContent>
    </Card>
  );
}
