import type { Trigram } from "../types";

interface TrigramData {
  name: string;
  chinese: string;
  attribute: string;
  element: string;
  image: string;
}

// Using a const assertion for better type inference
const TRIGRAMS: Record<string, Trigram> = {
  HEAVEN: {
    name: "Heaven",
    attribute: "Strong",
    element: "Metal",
    lines: [1, 1, 1],
  },
  EARTH: {
    name: "Earth",
    attribute: "Receptive",
    element: "Earth",
    lines: [0, 0, 0],
  },
  // ... add other trigrams
};

export type TrigramKey = keyof typeof TRIGRAMS;

export function getTrigramData(lines: number[]): Trigram | null {
  const key = Object.keys(TRIGRAMS).find((key) =>
    TRIGRAMS[key].lines.every((line, i) => line === lines[i])
  );
  return key ? TRIGRAMS[key] : null;
}

export function splitHexagramToTrigrams(lines: number[]): [number[], number[]] {
  const upper = lines.slice(0, 3);
  const lower = lines.slice(3);
  return [upper, lower];
}
