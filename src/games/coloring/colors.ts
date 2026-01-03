import type { ColorId } from "@/games/coloring/types";

export function colorToHex(c: ColorId | null): number {
  if (c === 1) return 0xef4444; // red
  if (c === 2) return 0x3b82f6; // blue
  if (c === 3) return 0x22c55e; // green
  return 0x0f172a; // default dark
}
