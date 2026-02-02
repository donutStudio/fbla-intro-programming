"use client";

import {
  usePetStore,
  type PetMood,
  type PetType,
  type PetEvolution,
  type PetAppearance,
  type AvatarMode,
} from "@/lib/pet-store";
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

const DEFAULT_APPEARANCE: PetAppearance = {
  color: "golden",
  pattern: "solid",
  accessory: "none",
  primaryTrait: "wings",
  secondaryTrait: "none",
};

const COLOR_MAP: Record<PetAppearance["color"], { base: string; accent: string }> =
  {
    charcoal: { base: "#1f2937", accent: "#6b7280" },
    golden: { base: "#f59e0b", accent: "#fcd34d" },
    cream: { base: "#fef3c7", accent: "#fbbf24" },
    sky: { base: "#7dd3fc", accent: "#38bdf8" },
    rose: { base: "#fb7185", accent: "#fda4af" },
  };

const renderPattern = (pattern: PetAppearance["pattern"], accent: string) => {
  switch (pattern) {
    case "spots":
      return (
        <>
          <circle cx="85" cy="120" r="10" fill={accent} opacity="0.7" />
          <circle cx="120" cy="135" r="8" fill={accent} opacity="0.7" />
          <circle cx="95" cy="150" r="6" fill={accent} opacity="0.7" />
        </>
      );
    case "stripes":
      return (
        <>
          <rect x="70" y="110" width="6" height="50" fill={accent} opacity="0.7" />
          <rect x="95" y="105" width="6" height="60" fill={accent} opacity="0.7" />
          <rect x="120" y="112" width="6" height="48" fill={accent} opacity="0.7" />
        </>
      );
    case "patches":
      return (
        <>
          <ellipse cx="85" cy="135" rx="18" ry="12" fill={accent} opacity="0.7" />
          <ellipse cx="120" cy="120" rx="14" ry="10" fill={accent} opacity="0.7" />
        </>
      );
    default:
      return null;
  }
};

const renderAccessory = (accessory: PetAppearance["accessory"]) => {
  switch (accessory) {
    case "bow":
      return (
        <g>
          <circle cx="96" cy="92" r="6" fill="#f472b6" />
          <circle cx="86" cy="92" r="8" fill="#fb7185" />
          <circle cx="106" cy="92" r="8" fill="#fb7185" />
        </g>
      );
    case "collar":
      return <rect x="78" y="118" width="44" height="8" rx="4" fill="#ef4444" />;
    case "hat":
      return (
        <g>
          <rect x="75" y="70" width="50" height="10" rx="4" fill="#111827" />
          <rect x="85" y="52" width="30" height="20" rx="6" fill="#1f2937" />
        </g>
      );
    case "bandana":
      return (
        <g>
          <rect x="76" y="120" width="48" height="10" rx="4" fill="#f97316" />
          <polygon points="100,130 110,150 90,150" fill="#f97316" />
        </g>
      );
    default:
      return null;
  }
};

const renderTrait = (trait: PetAppearance["primaryTrait"], evolution: PetEvolution) => {
  if (trait === "none" || evolution === "baby") return null;
  switch (trait) {
    case "wings":
      return (
        <>
          <ellipse cx="50" cy="120" rx="20" ry="30" fill="#e5e7eb" opacity="0.8" />
          <ellipse cx="150" cy="120" rx="20" ry="30" fill="#e5e7eb" opacity="0.8" />
        </>
      );
    case "crown":
      return (
        <polygon
          points="85,60 95,40 105,60 120,45 115,70 85,70 80,45"
          fill="#facc15"
        />
      );
    case "cape":
      return <path d="M70 125 L130 125 L155 175 L45 175 Z" fill="#2563eb" opacity="0.8" />;
    case "horns":
      return (
        <>
          <polygon points="78,70 70,40 90,55" fill="#9ca3af" />
          <polygon points="122,70 130,40 110,55" fill="#9ca3af" />
        </>
      );
    case "backpack":
      return <rect x="65" y="120" width="15" height="25" rx="4" fill="#10b981" />;
    case "sparkles":
      return (
        <>
          <polygon points="60,100 65,90 70,100 65,110" fill="#fcd34d" />
          <polygon points="140,95 145,85 150,95 145,105" fill="#fcd34d" />
        </>
      );
    default:
      return null;
  }
};

const renderSecondaryTrait = (
  trait: PetAppearance["secondaryTrait"],
  evolution: PetEvolution
) => {
  if (trait === "none" || evolution !== "adult") return null;
  return renderTrait(trait, evolution);
};

const renderPetShape = (type: PetType, fill: string, accent: string) => {
  switch (type) {
    case "dog":
      return (
        <>
          <ellipse cx="100" cy="135" rx="45" ry="40" fill={fill} />
          <circle cx="100" cy="95" r="32" fill={fill} />
          <ellipse cx="70" cy="85" rx="12" ry="22" fill={accent} />
          <ellipse cx="130" cy="85" rx="12" ry="22" fill={accent} />
          <ellipse cx="120" cy="155" rx="12" ry="10" fill={accent} />
        </>
      );
    case "bunny":
      return (
        <>
          <ellipse cx="100" cy="140" rx="40" ry="38" fill={fill} />
          <circle cx="100" cy="95" r="30" fill={fill} />
          <rect x="80" y="40" width="12" height="45" rx="6" fill={accent} />
          <rect x="108" y="40" width="12" height="45" rx="6" fill={accent} />
          <circle cx="140" cy="150" r="10" fill={accent} />
        </>
      );
    case "hamster":
      return (
        <>
          <ellipse cx="100" cy="135" rx="38" ry="34" fill={fill} />
          <circle cx="100" cy="100" r="26" fill={fill} />
          <circle cx="75" cy="85" r="10" fill={accent} />
          <circle cx="125" cy="85" r="10" fill={accent} />
          <ellipse cx="130" cy="155" rx="8" ry="6" fill={accent} />
        </>
      );
    case "cat":
    default:
      return (
        <>
          <ellipse cx="100" cy="135" rx="42" ry="36" fill={fill} />
          <circle cx="100" cy="95" r="30" fill={fill} />
          <polygon points="70,80 85,50 95,85" fill={accent} />
          <polygon points="130,80 115,50 105,85" fill={accent} />
          <path d="M140 140 Q170 130 150 160" stroke={accent} strokeWidth="6" fill="none" />
        </>
      );
  }
};

const renderFace = (mood: PetMood) => {
  const eyeY = 95;
  const mouthY = 112;
  return (
    <>
      <circle cx="88" cy={eyeY} r="4" fill="#111827" />
      <circle cx="112" cy={eyeY} r="4" fill="#111827" />
      <path
        d={
          mood === "sad"
            ? `M90 ${mouthY + 6} Q100 ${mouthY} 110 ${mouthY + 6}`
            : mood === "hungry"
              ? `M92 ${mouthY} Q100 ${mouthY + 8} 108 ${mouthY}`
              : `M90 ${mouthY} Q100 ${mouthY + 6} 110 ${mouthY}`
        }
        stroke="#111827"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </>
  );
};

function DynamicAvatar({
  type,
  mood,
  evolution,
  appearance,
}: {
  type: PetType;
  mood: PetMood;
  evolution: PetEvolution;
  appearance: PetAppearance;
}) {
  const palette = COLOR_MAP[appearance.color];
  return (
    <svg viewBox="0 0 200 200" className="h-56 w-56 md:h-64 md:w-64">
      {renderTrait(appearance.primaryTrait, evolution)}
      {renderSecondaryTrait(appearance.secondaryTrait, evolution)}
      {renderPetShape(type, palette.base, palette.accent)}
      {renderPattern(appearance.pattern, palette.accent)}
      {renderFace(mood)}
      {renderAccessory(appearance.accessory)}
    </svg>
  );
}

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
  const appearance = pet.appearance ?? DEFAULT_APPEARANCE;

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
          "relative rounded-full p-6 md:p-8 bg-gradient-to-br transition-all duration-500",
          MOOD_COLORS[mood],
          isInteracting && "animate-pulse-glow scale-110"
        )}
      >
        {avatarMode === "emoji" ? (
          <>
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
          </>
        ) : (
          <div className={cn("transition-transform", MOOD_EXPRESSIONS[mood])}>
            <DynamicAvatar
              type={pet.type}
              mood={mood}
              evolution={pet.evolution}
              appearance={appearance}
            />
          </div>
        )}

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
