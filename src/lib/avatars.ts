// Map avatar IDs (stored in DB) to their emoji characters
const avatarMap: Record<string, string> = {
  lion: "🦁",
  panda: "🐼",
  unicorn: "🦄",
  dragon: "🐲",
  fox: "🦊",
  owl: "🦉",
  penguin: "🐧",
  koala: "🐨",
  bunny: "🐰",
  cat: "🐱",
  dog: "🐶",
  bear: "🐻",
  monkey: "🐵",
  tiger: "🐯",
  elephant: "🐘",
  giraffe: "🦒",
  dolphin: "🐬",
  butterfly: "🦋",
  star: "⭐",
  rocket: "🚀",
};

/**
 * Resolves an avatar value to its emoji.
 * If the value is already an emoji (or not a known ID), returns it as-is.
 */
export function resolveAvatar(avatar: string): string {
  return avatarMap[avatar] || avatar;
}
