// Export all types from individual files
export * from "./hexagram";
export * from "./reading";

// Types for I Ching application

// Valid hexagram divination methods
export type HexagramMode = "yarrow" | "coins";

// Environment configuration
export interface EnvConfig {
  API_BASE_URL: string;
}

// Line types
export type LineValue = number; // Changed from string literals to number
export type LineType = "old_yin" | "old_yang" | "young_yin" | "young_yang";

// Trigram information
export interface Trigram {
  name: string;
  value: number;
  symbol?: string;
  properties?: string[];
}

// Line information with position and meaning
export interface LineInfo {
  position: number;
  value: LineValue; // Now expects a number
  type: LineType;
  isChanging: boolean;
  meaning?: string;
}

// Error response from API
export interface ApiError {
  detail: string;
  status?: number;
}
