export type CharacterSlug =
  | "fat-pig"
  | "dirty-donkey"
  | "cockroach"
  | "kechua"
  | "office-rat"
  | "machhar"
  | "corporate-bhains"
  | "chipkali"
  | "ganda-mendak"
  | "besharam-bandar"
  | "sewer-pigeon"
  | "dustbin-panda"
  | "sleepy-buffalo"
  | "toxic-frog"
  | "greasy-monkey"
  | "broken-lizard"
  | "stupid-goat"
  | "basement-rat";

export type AvatarState =
  | "idle"
  | "typing"
  | "laughing"
  | "angry"
  | "shocked"
  | "sleeping"
  | "celebrate"
  | "dead";

export type CharacterConfig = {
  id: string;
  slug: CharacterSlug;
  displayName: string;
  vibe: string;
  primary: string;
  secondary: string;
  bodyShape: "round" | "long" | "tall" | "flat" | "tiny" | "worm";
  has3DModel: boolean;
};

export type Reaction = {
  id: string;
  messageId: string;
  sessionId: string;
  emoji: string;
  createdAt: number;
};

export type Message = {
  id: string;
  sessionId: string;
  characterSlug: CharacterSlug;
  roomId: string;
  body: string;
  replyToMessageId?: string;
  createdAt: number;
  deletedAt?: number;
  status?: "sending" | "sent" | "failed";
  reactions?: Reaction[];
};

export type Room = {
  id: string;
  slug: string;
  name: string;
  description: string;
  emoji: string;
  createdAt: number;
};

export type Presence = {
  sessionId: string;
  characterSlug: CharacterSlug;
  joinedAt: number;
};

export type Session = {
  id: string;
  token: string;
  characterSlug: CharacterSlug;
  createdAt: number;
  lastSeenAt: number;
};

export type Report = {
  id: string;
  messageId: string;
  reporterSessionId: string;
  reason: string;
  createdAt: number;
  resolvedAt?: number;
};

export const REACTION_EMOJIS = [
  "😂",
  "💀",
  "😭",
  "🫡",
  "🤡",
  "👀",
  "🔥",
  "❤️",
] as const;
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

export const MAX_MESSAGE_LENGTH = 1000;
