"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Sparkles } from "lucide-react";

export function AboutPanel() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          About This Project
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-4">
        <div>
          <h3 className="font-semibold text-foreground mb-2">Requirements Covered</h3>
          <ul className="space-y-1">
            {[
              "Virtual pet care with customization and evolving stats",
              "Financial responsibility with spending + earnings tracking",
              "Analytics dashboard with charts and exportable reports",
              "Input validation across all forms",
              "Ask PetPal intelligent Q&A with recommendations",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-2">Advanced Features</h3>
          <ul className="space-y-1">
            {[
              "Demo Mode to accelerate time-based decay",
              "Mood reasoning panel with thresholds",
              "Event system with random pet events",
              "Optional ML-style action probabilities",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
