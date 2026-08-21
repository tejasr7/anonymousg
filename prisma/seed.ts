// ponytail: idempotent seed — safe to re-run.
// Self-contained (no @/ imports) so we don't fight tsx path resolution in
// the production container. CHARACTERS mirrors lib/characters.ts — keep in sync.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CHARACTERS = [
  { slug: "fat-pig",         displayName: "Fat Pig",         vibe: "very round pig, tiny legs",                   primary: "#F5A9B8", secondary: "#7A3D4D", bodyShape: "round" },
  { slug: "dirty-donkey",    displayName: "Dirty Donkey",    vibe: "messy fur, crooked badge",                    primary: "#A89B86", secondary: "#3D3528", bodyShape: "tall" },
  { slug: "cockroach",       displayName: "Cockroach",       vibe: "oversized headphones, tiny chair",           primary: "#5C3A1E", secondary: "#1F1408", bodyShape: "flat" },
  { slug: "kechua",          displayName: "Kechua",          vibe: "long worm, tie, expressive eyes",            primary: "#C49A6C", secondary: "#5C3A1E", bodyShape: "worm" },
  { slug: "office-rat",      displayName: "Office Rat",      vibe: "suspicious rat, hoodie, coffee",              primary: "#8A8A95", secondary: "#2A2A30", bodyShape: "tiny" },
  { slug: "machhar",         displayName: "Machhar",         vibe: "tiny, buzzing, annoying",                     primary: "#3D3D45", secondary: "#1A1A20", bodyShape: "tiny" },
  { slug: "corporate-bhains", displayName: "Corporate Bhains", vibe: "slow, formal, horns",                         primary: "#6B6B70", secondary: "#2A2A30", bodyShape: "tall" },
  { slug: "chipkali",        displayName: "Chipkali",        vibe: "wall climber, beady eyes",                    primary: "#7BA05B", secondary: "#2E3D22", bodyShape: "flat" },
  { slug: "ganda-mendak",    displayName: "Ganda Mendak",    vibe: "wet, slimy, unbothered",                      primary: "#7BA86B", secondary: "#2E4D22", bodyShape: "round" },
  { slug: "besharam-bandar", displayName: "Besharam Bandar", vibe: "loud, banana in hand",                        primary: "#8B5A3C", secondary: "#3D2418", bodyShape: "round" },
  { slug: "sewer-pigeon",    displayName: "Sewer Pigeon",    vibe: "droopy eye, knows too much",                  primary: "#9B9B9F", secondary: "#3A3A40", bodyShape: "round" },
  { slug: "dustbin-panda",   displayName: "Dustbin Panda",   vibe: "rummages, sleepy",                            primary: "#E8E8EC", secondary: "#3A3A40", bodyShape: "round" },
  { slug: "sleepy-buffalo",  displayName: "Sleepy Buffalo",  vibe: "horns, half asleep",                          primary: "#6B5240", secondary: "#2A1F18", bodyShape: "tall" },
  { slug: "toxic-frog",      displayName: "Toxic Frog",      vibe: "neon, smug",                                  primary: "#A8E85C", secondary: "#3D5C1E", bodyShape: "round" },
  { slug: "greasy-monkey",   displayName: "Greasy Monkey",   vibe: "oily, jittery",                               primary: "#8B6F4F", secondary: "#3D2E1E", bodyShape: "round" },
  { slug: "broken-lizard",   displayName: "Broken Lizard",   vibe: "one eye, tail bent",                          primary: "#7BA86B", secondary: "#2E4D22", bodyShape: "long" },
  { slug: "stupid-goat",     displayName: "Stupid Goat",     vibe: "chewing, vacant stare",                       primary: "#D8D2C8", secondary: "#5C5648", bodyShape: "tall" },
  { slug: "basement-rat",    displayName: "Basement Rat",    vibe: "red eyes, glowing",                           primary: "#9B5C5C", secondary: "#3D1F1F", bodyShape: "tiny" },
  { slug: "gadhe-ki-gaand",  displayName: "Gadhe Ki Gaand",  vibe: "loud, stubborn, kicks back",                  primary: "#8A7B68", secondary: "#3D342A", bodyShape: "round" },
  { slug: "baaill",          displayName: "Baaill",          vibe: "charges first, thinks later",                 primary: "#7A4A38", secondary: "#2E1B12", bodyShape: "tall" },
  { slug: "diarrhea-dump",   displayName: "Diarrhea Dump",   vibe: "urgent, messy, runs downhill",                primary: "#7A6638", secondary: "#3A2F18", bodyShape: "round" },
  { slug: "pus-pocket",      displayName: "Pus Pocket",      vibe: "tender to the touch, avoid squeezing",        primary: "#C8B858", secondary: "#4D4220", bodyShape: "round" },
  { slug: "booger-boss",     displayName: "Booger Boss",     vibe: "picks its own team",                          primary: "#7A8A4A", secondary: "#2E3A1A", bodyShape: "round" },
];

const ROOMS = [
  { id: "42069", slug: "42069", name: "42069", description: "the main room. everything happens here.", emoji: "🌑" },
  { id: "random", slug: "random", name: "random", description: "weird things only", emoji: "🎲" },
  { id: "memes",  slug: "memes",  name: "memes",  description: "send the cursed ones", emoji: "�" },
  { id: "lunch",  slug: "lunch",  name: "lunch",  description: "who's going down", emoji: "🍱" },
];

const OFFICE_CODES = [{ code: "42069" }];

async function main() {
  let charCount = 0;
  for (const c of CHARACTERS) {
    await prisma.character.upsert({
      where: { slug: c.slug },
      create: {
        id: String(charCount + 1).padStart(2, "0"),
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
    charCount++;
  }
  console.log(`✓ ${charCount} characters`);

  for (const r of ROOMS) {
    await prisma.room.upsert({
      where: { slug: r.slug },
      create: r,
      update: { name: r.name, description: r.description, emoji: r.emoji },
    });
  }
  console.log(`✓ ${ROOMS.length} rooms`);

  for (const o of OFFICE_CODES) {
    await prisma.officeCode.upsert({
      where: { code: o.code },
      create: o,
      update: {},
    });
  }
  console.log(`✓ ${OFFICE_CODES.length} office code`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
