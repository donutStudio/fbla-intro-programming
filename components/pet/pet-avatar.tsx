"use client";

import { usePetStore, type PetMood, type PetType, type PetEvolution } from "@/lib/pet-store";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface PetAvatarProps {
  isInteracting?: boolean;
}

const PET_EMOJIS: Record<PetType, Record<PetEvolution, string>> = {
  cat: { baby: "🐱", teen: "😺", adult: "😸" },
  dog: { baby: "🐶", teen: "🐕", adult: "🦮" },
  bunny: { baby: "🐰", teen: "🐇", adult: "🐇" },
  hamster: { baby: "🐹", teen: "🐹", adult: "🐹" },
};

const MOOD_COLORS: Record<PetMood, string> = {
  happy: "from-green-200 to-emerald-300",
  sad: "from-blue-200 to-indigo-300",
  hungry: "from-amber-200 to-orange-300",
  tired: "from-slate-200 to-slate-300",
  sick: "from-red-200 to-rose-300",
  energetic: "from-pink-200 to-fuchsia-300",
};

const MOOD_EXPRESSIONS: Record<PetMood, string> = {
  happy: "animate-bounce-soft",
  sad: "",
  hungry: "animate-wiggle",
  tired: "",
  sick: "",
  energetic: "animate-float",
};

export function PetAvatar({ isInteracting }: PetAvatarProps) {
  const pet = usePetStore((state) => state.pet);
  const getMood = usePetStore((state) => state.getMood);
  const [showHearts, setShowHearts] = useState(false);

  const mood = getMood();

  useEffect(() => {
    if (isInteracting) {
      setShowHearts(true);
      const timer = setTimeout(() => setShowHearts(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isInteracting]);

  if (!pet) return null;

  const emoji = PET_EMOJIS[pet.type][pet.evolution];

  return (
    <div className="relative flex flex-col items-center">
      {/* Floating hearts animation */}
      {showHearts && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="animate-bounce text-2xl"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              💕
            </span>
          ))}
        </div>
      )}

      {/* Pet container */}
      <div
        className={cn(
          "relative rounded-full p-8 bg-gradient-to-br transition-all duration-500",
          MOOD_COLORS[mood],
          isInteracting && "animate-pulse-glow scale-110"
        )}
      >
        {/* Evolution glow effect */}
        {pet.evolution !== "baby" && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
        )}

        {/* Pet emoji */}
        <span
          className={cn(
            "text-8xl md:text-9xl select-none transition-transform duration-300 block",
            MOOD_EXPRESSIONS[mood],
            mood === "tired" && "opacity-70",
            mood === "sick" && "grayscale"
          )}
        >
          {emoji}
        </span>

        {/* Mood indicator */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-card px-3 py-1 rounded-full shadow-lg border border-border">
          <span className="text-sm font-medium capitalize text-foreground">{mood}</span>
        </div>
      </div>

      {/* Pet name and age */}
      <div className="mt-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">{pet.name}</h2>
        <p className="text-muted-foreground mt-1">
          {pet.evolution === "baby" ? "Baby" : pet.evolution === "teen" ? "Teen" : "Adult"}{" "}
          {pet.type.charAt(0).toUpperCase() + pet.type.slice(1)} • Day {pet.age + 1}
        </p>
      </div>

      {/* Badges */}
      {pet.badges.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-xs">
          {pet.badges.map((badge) => (
            <span
              key={badge}
              className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full font-medium"
            >
              {badge}
            </span>
          ))}
        </div>
      )}

      {/* Tricks */}
      {pet.tricks.length > 0 && (
        <div className="mt-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Learned tricks:</p>
          <div className="flex flex-wrap gap-1 justify-center">
            {pet.tricks.map((trick) => (
              <span
                key={trick}
                className="px-2 py-0.5 text-xs bg-accent/50 text-accent-foreground rounded-full capitalize"
              >
                {trick}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
