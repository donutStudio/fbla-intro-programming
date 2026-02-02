"use client";

import { useMemo, useState } from "react";
import { usePetStore } from "@/lib/pet-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { buildAnswer, getRecommendationFactors } from "@/lib/domain/recommendations";
import { MessageSquare, Sparkles, Info } from "lucide-react";
import type { Recommendation } from "@/lib/domain/types";

interface ChatMessage {
  id: string;
  question: string;
  response: ReturnType<typeof buildAnswer>;
}

export function AskPetPal() {
  const { pet, balance, totalEarned, totalSpent } = usePetStore();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const sampleQuestions = useMemo(
    () => [
      "Why is my pet sick?",
      "How do I save money?",
      "What should I do next?",
      "How can I improve happiness fast?",
    ],
    []
  );

  if (!pet) return null;

  const handleAsk = (question: string) => {
    if (!question.trim()) return;
    const response = buildAnswer(question, pet, balance, totalSpent, totalEarned);
    setMessages((prev) => [
      { id: `msg-${Date.now()}`, question, response },
      ...prev,
    ]);
    setInput("");
  };

  const renderRecommendation = (recommendation: Recommendation) => {
    const key = `${recommendation.action}-${recommendation.reason}`;
    return (
      <div key={key} className="space-y-1">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="capitalize">
            {recommendation.action}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Confidence {Math.round(recommendation.confidence * 100)}%
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
        <p className="text-xs text-muted-foreground">{recommendation.impact}</p>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs"
          onClick={() =>
            setExpanded((prev) => ({
              ...prev,
              [key]: !prev[key],
            }))
          }
        >
          Why this?
        </Button>
        {expanded[key] && (
          <div className="text-xs text-muted-foreground flex items-start gap-2">
            <Info className="h-3 w-3 mt-0.5" />
            <span>{getRecommendationFactors(recommendation)}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Ask PetPal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about mood, savings, or next steps..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleAsk(input);
              }}
            />
            <Button onClick={() => handleAsk(input)}>Ask</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((question) => (
              <Button
                key={question}
                variant="outline"
                size="sm"
                onClick={() => handleAsk(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {messages.length === 0 && (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Ask a question to get personalized advice for your pet and budget.
          </CardContent>
        </Card>
      )}

      {messages.map((message) => (
        <Card key={message.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Q: {message.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {message.response.title}
              </p>
              <p>{message.response.summary}</p>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {message.response.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
            <div className="grid md:grid-cols-3 gap-3">
              {message.response.recommendations.map(renderRecommendation)}
            </div>
            <div className="bg-muted/40 rounded-lg p-3 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground mb-2">Optional ML insight</p>
              <p className="mb-2">Recommended action probabilities:</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(message.response.ml).map(([action, value]) => (
                  <div key={action} className="flex items-center justify-between">
                    <span className="capitalize">{action}</span>
                    <span>{Math.round(value * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
