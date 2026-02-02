"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Coins, HeartHandshake, Sparkles } from "lucide-react";

export function HelpPanel() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Help & Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="space-y-2">
            <h3 className="text-foreground font-semibold">Quick Start</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Create your pet by picking a type and name.</li>
              <li>Watch stats in the Pet Status card.</li>
              <li>Use Care Actions to feed, play, rest, clean, and visit the vet.</li>
              <li>Earn money by completing tasks in the Finance panel.</li>
              <li>Check Analytics to track spending and savings.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-foreground font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Stat Meanings
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Hunger: How full your pet feels.</li>
              <li>Happiness: Mood and joy level.</li>
              <li>Energy: Ability to play or learn tricks.</li>
              <li>Cleanliness: Hygiene impacts health.</li>
              <li>Health: Overall wellness and vet needs.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-foreground font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Time Effects
            </h3>
            <p>
              Stats decay with time. Hunger, happiness, energy, and cleanliness drop
              each hour. Low cleanliness or hunger can reduce health. Demo Mode speeds
              this up for presentations.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-foreground font-semibold flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              Earning & Spending
            </h3>
            <p>
              Complete tasks to earn money. Spending is tracked by category (food,
              toys, vet, supplies). Use the Analytics dashboard to see where money goes.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-foreground font-semibold flex items-center gap-2">
              <HeartHandshake className="h-4 w-4 text-primary" />
              Recommendations + Q&A
            </h3>
            <p>
              Use Ask PetPal to get answers about your pet, savings, or next actions.
              Recommendations are based on current stats and spending history. Tap
              “Why this?” to see the logic behind each suggestion.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
