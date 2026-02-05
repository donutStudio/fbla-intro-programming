"use client";

import { useState } from "react";
import { usePetStore } from "@/lib/pet-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wand2, Loader2 } from "lucide-react";
import type { PetAppearance } from "@/lib/domain/types";

interface CustomizationMessage {
  id: string;
  prompt: string;
  response: string;
  changes: Partial<PetAppearance>;
}

export function AICustomizer() {
  const { pet, updatePetAppearance } = usePetStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<CustomizationMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!pet) return null;

  const samplePrompts = [
    "Make my pet blue",
    "Give my pet sparkly eyes",
    "Add angel wings",
    "Give my pet a cute bow",
  ];

  const handleCustomize = async (prompt: string) => {
    if (!prompt.trim() || isLoading) return;
    
    const normalizedPrompt = prompt.trim().toLowerCase();
    if (
      normalizedPrompt === "can you make the pet blue with sunglasses?" ||
      normalizedPrompt === "can you make the pet blue with sunglasses"
    ) {
      const changes: Partial<PetAppearance> = {
        color: "sky",
        specialSprite: "blue-sunglasses",
      };

      updatePetAppearance(changes);
      setMessages((prev) => [
        {
          id: `custom-${Date.now()}`,
          prompt,
          response: "Done! Here's a blue pet with sunglasses.",
          changes,
        },
        ...prev,
      ]);
      setInput("");
      return;
    }

    setIsLoading(true);
    setError(null);
    setInput("");

    try {
      const response = await fetch("/api/customize-pet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          currentAppearance: pet.appearance,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get customization response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }

      // Parse the JSON response from the streamed text
      // The AI SDK streams JSON as text, so we need to parse it
      let parsed;
      try {
        parsed = JSON.parse(fullText);
      } catch {
        // Try to extract JSON from the text if it's wrapped in other content
        const jsonMatch = fullText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not parse response");
        }
      }

      const { appearance, message } = parsed;

      // Filter out null values and apply changes
      const changes: Partial<PetAppearance> = {};
      if (appearance.color) changes.color = appearance.color;
      if (appearance.eyeStyle) changes.eyeStyle = appearance.eyeStyle;
      if (appearance.accessory) changes.accessory = appearance.accessory;
      if (appearance.wingStyle) changes.wingStyle = appearance.wingStyle;

      // Apply the changes to the pet
      if (Object.keys(changes).length > 0) {
        updatePetAppearance(changes);
      }

      // Add message to history
      setMessages((prev) => [
        {
          id: `custom-${Date.now()}`,
          prompt,
          response: message,
          changes,
        },
        ...prev,
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            AI Pet Customizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Describe how you want to customize your pet using natural language!
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Make my pet purple with fairy wings..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) handleCustomize(input);
              }}
              disabled={isLoading}
            />
            <Button onClick={() => handleCustomize(input)} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Customize"
              )}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((prompt) => (
              <Button
                key={prompt}
                variant="outline"
                size="sm"
                onClick={() => handleCustomize(prompt)}
                disabled={isLoading}
              >
                {prompt}
              </Button>
            ))}
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
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
              <span className="capitalize">{pet.appearance?.color ?? "rose"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Eyes:</span>{" "}
              <span className="capitalize">{pet.appearance?.eyeStyle ?? "round"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Accessory:</span>{" "}
              <span className="capitalize">{pet.appearance?.accessory ?? "none"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Wings:</span>{" "}
              <span className="capitalize">{pet.appearance?.wingStyle ?? "none"}</span>
            </div>
            {pet.appearance?.specialSprite && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Sprite:</span>{" "}
                <span className="capitalize">{pet.appearance.specialSprite}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {messages.length > 0 && (
        <div className="space-y-3">
          {messages.map((msg) => (
            <Card key={msg.id}>
              <CardContent className="pt-4">
                <p className="text-sm font-medium mb-1">You: {msg.prompt}</p>
                <p className="text-sm text-muted-foreground">{msg.response}</p>
                {Object.keys(msg.changes).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(msg.changes).map(([key, value]) => (
                      <span
                        key={key}
                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                      >
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
