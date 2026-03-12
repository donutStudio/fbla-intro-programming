"use client";

import {
  usePetStore,
  type PetMood,
  type PetType,
  type PetEvolution,
  type AvatarMode,
} from "@/lib/pet-store";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { LAYER_SLOT_PRIORITY, PET_LAYER_CONFIG, type PetLayerSlot } from "@/lib/pet-layer-config";

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

const SLOT_LAYER_CLASS: Record<PetLayerSlot, string> = {
  back: "z-10 scale-[1.08]",
  body: "z-20",
  neck: "z-40 translate-y-6 scale-[0.9]",
  head: "z-40 -translate-y-6 scale-[0.85]",
  face: "z-50 -translate-y-1 scale-[0.62]",
  extra: "z-[60]",
};

const DEFAULT_TINT = "#ff6fa1";

const cssColorToRgb = (value: string) => {
  if (typeof window === "undefined") return null;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#000";
  ctx.fillStyle = value;
  const normalized = ctx.fillStyle;

  const match = normalized.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) return null;

  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
  };
};

const rgbToHue = ({ r, g, b }: { r: number; g: number; b: number }) => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  if (delta === 0) return 0;

  let hue = 0;
  if (max === rn) hue = ((gn - bn) / delta) % 6;
  else if (max === gn) hue = (bn - rn) / delta + 2;
  else hue = (rn - gn) / delta + 4;

  return Math.round(hue * 60);
};

export function PetAvatar({ isInteracting }: PetAvatarProps) {
  const pet = usePetStore((state) => state.pet);
  const getMood = usePetStore((state) => state.getMood);
  const avatarMode = usePetStore((state) => state.avatarMode) as AvatarMode;
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
  const appearance = pet.appearance;
  const showDynamic = avatarMode === "dynamic";

  const requestedTint = appearance.color || DEFAULT_TINT;
  const tintRgb = useMemo(() => cssColorToRgb(requestedTint), [requestedTint]);
  const tintColor = tintRgb ? requestedTint : DEFAULT_TINT;
  const tintHue = useMemo(() => (tintRgb ? rgbToHue(tintRgb) : rgbToHue({ r: 255, g: 111, b: 161 })), [tintRgb]);

  const tintFilter = showDynamic
    ? `grayscale(1) sepia(1) saturate(9000%) hue-rotate(${tintHue}deg) brightness(1.08) contrast(1.22)`
    : "none";

  const layerIds = appearance.layerIds ?? [];
  const sortedLayerIds = useMemo(() => {
    return [...layerIds].sort((a, b) => {
      const slotA = PET_LAYER_CONFIG[a]?.slot ?? "extra";
      const slotB = PET_LAYER_CONFIG[b]?.slot ?? "extra";
      return LAYER_SLOT_PRIORITY.indexOf(slotA) - LAYER_SLOT_PRIORITY.indexOf(slotB);
    });
  }, [layerIds]);

  return (
    <div className="relative flex flex-col items-center">
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

      <div
        className={cn(
          "relative rounded-full p-6 md:p-8 bg-gradient-to-br transition-all duration-500",
          MOOD_COLORS[mood],
          isInteracting && "animate-pulse-glow scale-110"
        )}
      >
        {pet.evolution !== "baby" && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
        )}

        <div className={cn("relative h-56 w-56 md:h-64 md:w-64", MOOD_EXPRESSIONS[mood])}>
          {showDynamic &&
            sortedLayerIds.map((layerId) => {
              const layer = PET_LAYER_CONFIG[layerId];
              const slot = layer?.slot ?? "extra";
              return (
                <img
                  key={layerId}
                  src={`/pet-layers/${layerId}.png`}
                  alt={layer?.label ?? layerId}
                  className={cn(
                    "absolute inset-0 h-full w-full object-contain pointer-events-none",
                    SLOT_LAYER_CLASS[slot]
                  )}
                />
              );
            })}

          <span
            className={cn(
              "absolute inset-0 z-30 flex items-center justify-center text-8xl md:text-9xl select-none transition-transform duration-300",
              mood === "tired" && "opacity-70",
              mood === "sick" && "grayscale"
            )}
            style={{
              filter: tintFilter,
              color: showDynamic ? tintColor : "inherit",
              textShadow: showDynamic
                ? `0 0 10px ${tintColor}, 0 0 24px ${tintColor}`
                : "none",
            }}
          >
            {emoji}
          </span>
        </div>

        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-card px-3 py-1 rounded-full shadow-lg border border-border">
          <span className="text-sm font-medium capitalize text-foreground">{mood}</span>
        </div>
      </div>

      <div className="mt-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">{pet.name}</h2>
        <p className="text-muted-foreground mt-1">
          {pet.evolution === "baby" ? "Baby" : pet.evolution === "teen" ? "Teen" : "Adult"}{" "}
          {pet.type.charAt(0).toUpperCase() + pet.type.slice(1)} • Day {pet.age + 1}
        </p>
      </div>

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
    </div>
  );
}
