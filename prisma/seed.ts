// ponytail: idempotent seed — safe to re-run.

import { PrismaClient } from "@prisma/client";
import { CHARACTERS } from "../lib/characters";

const prisma = new PrismaClient();

const ROOMS = [
  {
    id: "general",
    slug: "general",
    name: "general",
    description: "say anything stupid",
    emoji: "🪑",
  },
  {
    id: "random",
    slug: "random",
    name: "random",
    description: "weird things only",
    emoji: "🎲",
  },
  {
    id: "memes",
    slug: "memes",
    name: "memes",
    description: "send the cursed ones",
    emoji: "🪼",
  },
  {
    id: "lunch",
    slug: "lunch",
    name: "lunch",
    description: "who's going down",
    emoji: "🍱",
  },
];

async function main() {
  for (const c of CHARACTERS) {
    await prisma.character.upsert({
      where: { slug: c.slug },
      create: {
        id: c.id,
        slug: c.slug,
        displayName: c.displayName,
        vibe: c.vibe,
        primary: c.primary,
        secondary: c.secondary,
        bodyShape: c.bodyShape,
      },
      update: {
        displayName: c.displayName,
        vibe: c.vibe,
        primary: c.primary,
        secondary: c.secondary,
        bodyShape: c.bodyShape,
      },
    });
  }
  console.log(`✓ ${CHARACTERS.length} characters`);

  for (const r of ROOMS) {
    await prisma.room.upsert({
      where: { slug: r.slug },
      create: r,
      update: { name: r.name, description: r.description, emoji: r.emoji },
    });
  }
  console.log(`✓ ${ROOMS.length} rooms`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
