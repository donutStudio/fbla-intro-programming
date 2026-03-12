"use client";

import { useState } from "react";
import { usePetStore } from "@/lib/pet-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wand2 } from "lucide-react";
import {
  CUSTOMIZATION_DISABLED_MESSAGE,
  type CustomizePetResponse,
} from "@/lib/domain/pet-customization";

export function AICustomizer() {
  const { pet } = usePetStore();
  const [input, setInput] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!pet) return null;

  const samplePrompts = [
    "Make my pet blue",
    "Add blue sunglasses",
    "Clear all layered accessories",
  ];

  const checkAvailability = async (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

    try {
      const response = await fetch("/api/customize-pet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmedPrompt,
          currentAppearance: pet.appearance,
        }),
      });

      const parsed = (await response.json()) as CustomizePetResponse;
      setStatusMessage(parsed.message);
      setInput("");
    } catch {
      setStatusMessage(CUSTOMIZATION_DISABLED_MESSAGE);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Pet Customizer (Temporarily Disabled)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Natural-language customization is currently offline, but the endpoint and response
            shape are still wired for future reactivation.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Customization requests are currently unavailable"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") checkAvailability(input);
              }}
            />
            <Button onClick={() => checkAvailability(input)} variant="secondary">
              Check Status
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((prompt) => (
              <Button key={prompt} variant="outline" size="sm" onClick={() => checkAvailability(prompt)}>
                {prompt}
              </Button>
            ))}
          </div>
          <p className="text-sm text-amber-600">{statusMessage ?? CUSTOMIZATION_DISABLED_MESSAGE}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Current Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Color:</span>{" "}
              <span className="capitalize">{pet.appearance?.color ?? "#ff6fa1"}</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Layers:</span>{" "}
              <span>{(pet.appearance?.layerIds ?? []).join(", ") || "none"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
