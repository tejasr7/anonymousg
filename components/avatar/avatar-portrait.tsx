"use client";

// ponytail: cheap 2D portraits — drop-in for production WebP/AVIF later.

import { cn } from "@/lib/utils";
import { getCharacter } from "@/lib/characters";
import type { CharacterConfig, CharacterSlug } from "@/types";

export function PortraitSvg({
  character,
  className,
}: {
  character: CharacterConfig;
  className?: string;
}) {
  const p = character.primary;
  const s = character.secondary;
  const common = {
    className,
    viewBox: "0 0 64 64",
    xmlns: "http://www.w3.org/2000/svg",
  } as const;
  switch (character.slug) {
    case "fat-pig":
      return (
        <svg {...common}>
          <circle cx="32" cy="36" r="22" fill={p} stroke="#000" strokeWidth="3" />
          <ellipse cx="32" cy="40" rx="11" ry="8" fill="#E58FA0" stroke="#000" strokeWidth="2" />
          <circle cx="28" cy="38" r="1.5" fill="#000" />
          <circle cx="36" cy="38" r="1.5" fill="#000" />
          <path d="M14 30 L8 22 L14 24 Z" fill={p} stroke="#000" strokeWidth="2" />
          <path d="M50 30 L56 22 L50 24 Z" fill={p} stroke="#000" strokeWidth="2" />
          <circle cx="24" cy="32" r="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="40" cy="32" r="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="24" cy="32" r="1" fill="#000" />
          <circle cx="40" cy="32" r="1" fill="#000" />
        </svg>
      );
    case "dirty-donkey":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="38" rx="22" ry="20" fill={p} stroke="#000" strokeWidth="3" />
          <rect x="20" y="34" width="24" height="18" rx="4" fill="#C0B3A0" stroke="#000" strokeWidth="2" />
          <circle cx="26" cy="42" r="1.5" fill="#000" />
          <circle cx="38" cy="42" r="1.5" fill="#000" />
          <ellipse cx="22" cy="22" rx="4" ry="8" fill={s} stroke="#000" strokeWidth="2" transform="rotate(-20 22 22)" />
          <ellipse cx="42" cy="22" rx="4" ry="8" fill={s} stroke="#000" strokeWidth="2" transform="rotate(20 42 22)" />
          <circle cx="24" cy="30" r="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="40" cy="30" r="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
        </svg>
      );
    case "cockroach":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="34" rx="22" ry="14" fill={p} stroke="#000" strokeWidth="3" />
          <ellipse cx="32" cy="26" rx="14" ry="10" fill={p} stroke="#000" strokeWidth="2" />
          <path d="M16 18 Q24 6 32 12" stroke="#000" strokeWidth="2" fill="none" />
          <path d="M48 18 Q40 6 32 12" stroke="#000" strokeWidth="2" fill="none" />
          <circle cx="26" cy="24" r="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="38" cy="24" r="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <rect x="6" y="22" width="6" height="6" fill="#C8FF3D" stroke="#000" strokeWidth="2" />
          <rect x="52" y="22" width="6" height="6" fill="#C8FF3D" stroke="#000" strokeWidth="2" />
          <path d="M6 22 Q32 12 58 22" stroke="#000" strokeWidth="2" fill="none" />
        </svg>
      );
    case "kechua":
      return (
        <svg {...common}>
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx={20 + i * 6}
              cy={32 + Math.sin(i) * 2}
              r={9 - i * 0.8}
              fill={i === 4 ? p : s}
              stroke="#000"
              strokeWidth="2"
            />
          ))}
          <circle cx="50" cy="34" r="10" fill={p} stroke="#000" strokeWidth="2" />
          <circle cx="47" cy="32" r="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="53" cy="32" r="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="47" cy="32" r="1" fill="#000" />
          <circle cx="53" cy="32" r="1" fill="#000" />
          <rect x="38" y="44" width="6" height="4" fill="#C8FF3D" stroke="#000" strokeWidth="1.5" transform="rotate(-20 41 46)" />
        </svg>
      );
    case "office-rat":
      return (
        <svg {...common}>
          <path d="M14 24 L32 14 L50 24 L50 50 L14 50 Z" fill={s} stroke="#000" strokeWidth="3" />
          <circle cx="32" cy="34" r="14" fill={p} stroke="#000" strokeWidth="2" />
          <circle cx="27" cy="32" r="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="37" cy="32" r="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="27" cy="32" r="1" fill="#000" />
          <circle cx="37" cy="32" r="1" fill="#000" />
          <path d="M32 38 L30 42 L34 42 Z" fill={s} stroke="#000" strokeWidth="1.5" />
        </svg>
      );
    case "machhar":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="34" rx="6" ry="14" fill={p} stroke="#000" strokeWidth="2" />
          <ellipse cx="22" cy="28" rx="10" ry="5" fill={p} stroke="#000" strokeWidth="2" transform="rotate(-30 22 28)" />
          <ellipse cx="42" cy="28" rx="10" ry="5" fill={p} stroke="#000" strokeWidth="2" transform="rotate(30 42 28)" />
          <circle cx="30" cy="26" r="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="34" cy="26" r="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <line x1="32" y1="14" x2="30" y2="8" stroke="#000" strokeWidth="2" />
          <line x1="32" y1="14" x2="34" y2="8" stroke="#000" strokeWidth="2" />
        </svg>
      );
    case "corporate-bhains":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="40" rx="22" ry="18" fill={p} stroke="#000" strokeWidth="3" />
          <path d="M12 26 L8 8 L18 22 Z" fill={s} stroke="#000" strokeWidth="2" />
          <path d="M52 26 L56 8 L46 22 Z" fill={s} stroke="#000" strokeWidth="2" />
          <ellipse cx="32" cy="46" rx="10" ry="6" fill="#D8D2C8" stroke="#000" strokeWidth="2" />
          <circle cx="28" cy="42" r="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="36" cy="42" r="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="28" cy="42" r="1" fill="#000" />
          <circle cx="36" cy="42" r="1" fill="#000" />
          <rect x="22" y="22" width="20" height="3" fill="#000" />
        </svg>
      );
    case "chipkali":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="32" rx="24" ry="10" fill={p} stroke="#000" strokeWidth="3" />
          <circle cx="52" cy="32" r="8" fill={p} stroke="#000" strokeWidth="2" />
          <circle cx="54" cy="30" r="3" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="54" cy="30" r="1.5" fill="#000" />
          {[-0.4, -0.2, 0, 0.2, 0.4].map((a, i) => (
            <line key={i} x1={32 + Math.cos(a) * 24} y1={32 + Math.sin(a) * 10} x2={32 + Math.cos(a) * 32} y2={32 + Math.sin(a) * 18} stroke="#000" strokeWidth="2" />
          ))}
        </svg>
      );
    case "ganda-mendak":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="40" rx="24" ry="18" fill={p} stroke="#000" strokeWidth="3" />
          <circle cx="24" cy="22" r="5" fill="#fff" stroke="#000" strokeWidth="2" />
          <circle cx="40" cy="22" r="5" fill="#fff" stroke="#000" strokeWidth="2" />
          <circle cx="24" cy="22" r="2" fill="#000" />
          <circle cx="40" cy="22" r="2" fill="#000" />
          <path d="M22 38 Q32 48 42 38" stroke="#000" strokeWidth="2" fill="none" />
        </svg>
      );
    case "besharam-bandar":
      return (
        <svg {...common}>
          <circle cx="32" cy="34" r="22" fill={p} stroke="#000" strokeWidth="3" />
          <ellipse cx="20" cy="22" rx="5" ry="7" fill={p} stroke="#000" strokeWidth="2" />
          <ellipse cx="44" cy="22" rx="5" ry="7" fill={p} stroke="#000" strokeWidth="2" />
          <circle cx="26" cy="32" r="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="38" cy="32" r="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="26" cy="32" r="1" fill="#000" />
          <circle cx="38" cy="32" r="1" fill="#000" />
          <path d="M14 50 Q22 58 30 52" stroke="#000" strokeWidth="3" fill={p} />
        </svg>
      );
    case "sewer-pigeon":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="36" rx="22" ry="18" fill={p} stroke="#000" strokeWidth="3" />
          <path d="M48 32 L58 30 L52 38 Z" fill="#FFB454" stroke="#000" strokeWidth="2" />
          <circle cx="28" cy="32" r="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <path d="M30 34 Q26 38 32 38" stroke="#000" strokeWidth="2" fill="none" />
          <circle cx="40" cy="36" r="1.5" fill="#000" />
        </svg>
      );
    case "dustbin-panda":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="38" rx="22" ry="20" fill={p} stroke="#000" strokeWidth="3" />
          <ellipse cx="22" cy="26" rx="5" ry="6" fill="#000" />
          <ellipse cx="42" cy="26" rx="5" ry="6" fill="#000" />
          <ellipse cx="26" cy="34" rx="4" ry="5" fill="#000" />
          <ellipse cx="38" cy="34" rx="4" ry="5" fill="#000" />
          <circle cx="26" cy="34" r="1.5" fill="#fff" />
          <circle cx="38" cy="34" r="1.5" fill="#fff" />
          <ellipse cx="32" cy="44" rx="3" ry="2" fill="#000" />
        </svg>
      );
    case "sleepy-buffalo":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="40" rx="22" ry="18" fill={p} stroke="#000" strokeWidth="3" />
          <path d="M14 28 Q10 16 16 14 Q22 18 18 26 Z" fill={s} stroke="#000" strokeWidth="2" />
          <path d="M50 28 Q54 16 48 14 Q42 18 46 26 Z" fill={s} stroke="#000" strokeWidth="2" />
          <path d="M22 38 Q32 48 42 38" stroke="#000" strokeWidth="3" fill="none" />
          <path d="M24 32 Q28 30 32 32" stroke="#000" strokeWidth="2" fill="none" />
          <path d="M40 32 Q36 30 32 32" stroke="#000" strokeWidth="2" fill="none" />
        </svg>
      );
    case "toxic-frog":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="38" rx="24" ry="20" fill={p} stroke="#000" strokeWidth="3" />
          <ellipse cx="22" cy="24" rx="8" ry="8" fill={p} stroke="#000" strokeWidth="2" />
          <ellipse cx="42" cy="24" rx="8" ry="8" fill={p} stroke="#000" strokeWidth="2" />
          <circle cx="22" cy="24" r="3" fill="#000" />
          <circle cx="42" cy="24" r="3" fill="#000" />
          <path d="M20 44 Q32 52 44 44" stroke="#000" strokeWidth="3" fill="none" />
        </svg>
      );
    case "greasy-monkey":
      return (
        <svg {...common}>
          <circle cx="32" cy="36" r="22" fill={p} stroke="#000" strokeWidth="3" />
          <ellipse cx="20" cy="22" rx="5" ry="6" fill={p} stroke="#000" strokeWidth="2" />
          <ellipse cx="44" cy="22" rx="5" ry="6" fill={p} stroke="#000" strokeWidth="2" />
          <circle cx="26" cy="32" r="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="38" cy="32" r="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <ellipse cx="32" cy="44" rx="8" ry="4" fill={s} stroke="#000" strokeWidth="2" />
        </svg>
      );
    case "broken-lizard":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="34" rx="20" ry="8" fill={p} stroke="#000" strokeWidth="3" />
          <circle cx="48" cy="34" r="8" fill={p} stroke="#000" strokeWidth="2" />
          <path d="M14 34 Q4 30 8 24" stroke={p} strokeWidth="6" fill="none" />
          <circle cx="50" cy="32" r="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <path d="M44 36 L46 38" stroke="#000" strokeWidth="3" />
          {[-0.3, -0.1, 0.1, 0.3].map((a, i) => (
            <line key={i} x1={32 + a * 20} y1={42} x2={32 + a * 24} y2={48} stroke="#000" strokeWidth="2" />
          ))}
        </svg>
      );
    case "stupid-goat":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="38" rx="22" ry="20" fill={p} stroke="#000" strokeWidth="3" />
          <path d="M16 22 Q8 8 14 12 Q22 14 22 24 Z" fill={s} stroke="#000" strokeWidth="2" />
          <path d="M48 22 Q56 8 50 12 Q42 14 42 24 Z" fill={s} stroke="#000" strokeWidth="2" />
          <ellipse cx="32" cy="46" rx="10" ry="6" fill={s} stroke="#000" strokeWidth="2" />
          <circle cx="27" cy="32" r="1.5" fill="#000" />
          <circle cx="37" cy="32" r="1.5" fill="#000" />
          <rect x="22" y="32" width="20" height="2" fill="#000" />
        </svg>
      );
    case "basement-rat":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="38" rx="22" ry="16" fill={p} stroke="#000" strokeWidth="3" />
          <circle cx="22" cy="30" r="3" fill="#FF5A5A" />
          <circle cx="42" cy="30" r="3" fill="#FF5A5A" />
          <circle cx="22" cy="30" r="1.5" fill="#000" />
          <circle cx="42" cy="30" r="1.5" fill="#000" />
          <path d="M28 42 Q32 46 36 42" stroke="#000" strokeWidth="2" fill="none" />
          <path d="M16 50 L12 56 M48 50 L52 56" stroke="#000" strokeWidth="2" />
        </svg>
      );
    case "gadhe-ki-gaand":
      return (
        <svg {...common}>
          {/* ponytail: donkey's ass — rounded with a tuft + tail. */}
          <ellipse cx="32" cy="34" rx="22" ry="20" fill={p} stroke="#000" strokeWidth="3" />
          {/* tail */}
          <path d="M52 30 Q60 28 56 18" stroke="#000" strokeWidth="3" fill="none" />
          <circle cx="56" cy="18" r="2" fill={s} />
          {/* tuft */}
          <path d="M28 16 Q32 10 36 16" stroke="#000" strokeWidth="2" fill="none" />
          {/* ass-hole */}
          <circle cx="32" cy="40" r="3" fill={s} stroke="#000" strokeWidth="2" />
          {/* eyes (looking back, annoyed) */}
          <circle cx="22" cy="30" r="3" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="42" cy="30" r="3" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="22" cy="30" r="1.5" fill="#000" />
          <circle cx="42" cy="30" r="1.5" fill="#000" />
          {/* angry mouth */}
          <path d="M26 44 L38 44" stroke="#000" strokeWidth="2" />
        </svg>
      );
    case "baaill":
      return (
        <svg {...common}>
          {/* ponytail: bull — red-brown with horns, angry. */}
          <ellipse cx="32" cy="38" rx="20" ry="18" fill={p} stroke="#000" strokeWidth="3" />
          {/* horns */}
          <path d="M18 22 Q12 12 14 18 Q14 22 18 24" fill={s} stroke="#000" strokeWidth="2" />
          <path d="M46 22 Q52 12 50 18 Q50 22 46 24" fill={s} stroke="#000" strokeWidth="2" />
          {/* snout */}
          <ellipse cx="32" cy="44" rx="10" ry="6" fill="#D8B898" stroke="#000" strokeWidth="2" />
          <circle cx="29" cy="42" r="1.2" fill="#000" />
          <circle cx="35" cy="42" r="1.2" fill="#000" />
          {/* angry eyes */}
          <circle cx="24" cy="32" r="2.5" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="40" cy="32" r="2.5" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="24" cy="32" r="1.2" fill="#000" />
          <circle cx="40" cy="32" r="1.2" fill="#000" />
          {/* angry eyebrows */}
          <path d="M20 28 L28 30" stroke="#000" strokeWidth="2" />
          <path d="M44 28 L36 30" stroke="#000" strokeWidth="2" />
        </svg>
      );
    case "diarrhea-dump":
      return (
        <svg {...common}>
          {/* ponytail: runny brown mess — irregular shape with drips. */}
          <path
            d="M14 38 Q12 30 18 24 Q20 16 30 18 Q40 14 44 22 Q52 26 50 36 Q54 46 46 50 L46 56 L40 50 L30 54 L22 48 L18 56 L14 46 Z"
            fill={p}
            stroke="#000"
            strokeWidth="3"
          />
          {/* drip highlight */}
          <ellipse cx="28" cy="26" rx="4" ry="3" fill={s} opacity="0.6" />
          {/* sick eyes */}
          <circle cx="26" cy="32" r="3" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="38" cy="32" r="3" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="26" cy="32" r="1.5" fill="#000" />
          <circle cx="38" cy="32" r="1.5" fill="#000" />
          {/* tired circles under eyes */}
          <path d="M22 36 Q26 38 30 36" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M34 36 Q38 38 42 36" stroke="#000" strokeWidth="1.5" fill="none" />
          {/* weak mouth */}
          <path d="M28 40 Q32 38 36 40" stroke="#000" strokeWidth="1.5" fill="none" />
          {/* drips below */}
          <ellipse cx="20" cy="54" rx="2" ry="3" fill={p} />
          <ellipse cx="32" cy="58" rx="1.5" ry="2.5" fill={p} />
          <ellipse cx="44" cy="54" rx="2" ry="3" fill={p} />
        </svg>
      );
    case "pus-pocket":
      return (
        <svg {...common}>
          {/* ponytail: yellow blister with face, sickly. */}
          <ellipse cx="32" cy="36" rx="22" ry="20" fill={p} stroke="#000" strokeWidth="3" />
          {/* pus highlight */}
          <ellipse cx="26" cy="26" rx="6" ry="4" fill="#F0DC8C" opacity="0.8" />
          <ellipse cx="38" cy="40" rx="3" ry="2" fill="#F0DC8C" opacity="0.6" />
          {/* pimple on top */}
          <circle cx="42" cy="20" r="3" fill="#E8B858" stroke="#000" strokeWidth="1.5" />
          {/* sick eyes */}
          <circle cx="24" cy="34" r="2.5" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="40" cy="34" r="2.5" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="24" cy="34" r="1.5" fill="#000" />
          <circle cx="40" cy="34" r="1.5" fill="#000" />
          {/* grimace */}
          <path d="M26 42 L38 42" stroke="#000" strokeWidth="2" />
          <path d="M28 44 L36 44" stroke="#000" strokeWidth="1.5" />
        </svg>
      );
    case "booger-boss":
      return (
        <svg {...common}>
          {/* ponytail: green mucus blob with a crown. */}
          <ellipse cx="32" cy="38" rx="22" ry="18" fill={p} stroke="#000" strokeWidth="3" />
          {/* crown */}
          <path d="M20 22 L24 12 L28 18 L32 10 L36 18 L40 12 L44 22 Z" fill="#C8FF3D" stroke="#000" strokeWidth="2" />
          <circle cx="32" cy="14" r="2" fill="#C8FF3D" stroke="#000" strokeWidth="1.5" />
          {/* slime highlight */}
          <ellipse cx="24" cy="28" rx="5" ry="3" fill="#A8C84A" opacity="0.7" />
          {/* boss eyes (small, mean) */}
          <path d="M22 32 L28 34" stroke="#000" strokeWidth="2.5" />
          <path d="M36 34 L42 32" stroke="#000" strokeWidth="2.5" />
          <circle cx="25" cy="36" r="1" fill="#000" />
          <circle cx="39" cy="36" r="1" fill="#000" />
          {/* smug mouth */}
          <path d="M24 44 Q32 48 40 44" stroke="#000" strokeWidth="2" fill="none" />
          {/* drip */}
          <ellipse cx="44" cy="52" rx="1.5" ry="2.5" fill={p} />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="24" fill={p} stroke="#000" strokeWidth="3" />
          <circle cx="24" cy="30" r="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="40" cy="30" r="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
        </svg>
      );
  }
}

export function AvatarPortrait({
  slug,
  character,
  size = 40,
  className,
  ring,
}: {
  slug?: CharacterSlug;
  character?: CharacterConfig;
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  if (!character && slug) character = getCharacter(slug);
  if (!character) return null;
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "inline-flex items-center justify-center bg-bg-elevated border-2 border-black overflow-hidden shrink-0",
        ring && "shadow-chunky-sm",
        className
      )}
    >
      <PortraitSvg character={character} className="w-full h-full" />
    </div>
  );
}
