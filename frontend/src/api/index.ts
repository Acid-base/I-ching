import axios from "axios";
import { HexagramMode } from "../types";

// Fix process.env reference by using import.meta.env for Vite
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Updated API base URL to match the backend configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Standardized response type to match backend structure (partially adjusted)
// NOTE: This interface might need further refinement to perfectly match the
// backend's nested structure { cast_result: {...}, primary_hexagram: {...}, ... }
export interface ReadingResponse {
  // Assuming the backend might flatten the response or this is an intended structure
  hexagram_number: number; // Corresponds to primary_hexagram_number
  changing_line_indices: number[]; // Renamed, assumes 0-based indices from backend
  lines: number[]; // Changed from string[] to number[]
  reading: {
    // Corresponds to primary_hexagram data
    number: number;
    name: string;
    chinese: string; // Assuming backend provides this
    judgment: string;
    image: string;
    // Backend provides line details within hexagram data, adjust if needed
    lines?: Array<{ lineNumber: number; meaning: string }>;
    trigrams?: {
      // Assuming backend might provide this structure
      upper: { name: string; value: number };
      lower: { name: string; value: number };
    };
  };
  relating_hexagram?: {
    // Corresponds to transformed_hexagram data
    number: number; // Corresponds to transformed_hexagram_number
    name: string;
    judgment: string;
    image: string;
    lines?: Array<{ lineNumber: number; meaning: string }>; // If backend provides transformed line meanings
    trigrams?: {
      upper: { name: string; value: number };
      lower: { name: string; value: number };
    };
  };
  // Include raw cast_result if needed by frontend components
  cast_result?: {
    lines: number[];
    changing_line_indices: number[];
    primary_hexagram_number: number;
    transformed_hexagram_number?: number;
    transformed_lines?: number[];
  };
}

// Cast hexagram with consistent error handling
export const castHexagram = async (
  mode: HexagramMode,
): Promise<ReadingResponse> => {
  try {
    // The backend returns { cast_result: {...}, primary_hexagram: {...}, ... }
    // The frontend might need to adapt to this structure or the backend needs adjustment.
    // Assuming for now the backend might transform the response or the frontend handles it.
    const response = await api.post("/cast", {
      mode,
      verbose: false, // Keep verbose false unless needed for debugging
    });
    // TODO: Potentially transform response.data here if it doesn't match ReadingResponse
    return response.data;
  } catch (error) {
    console.error("Error casting hexagram:", error);
    // Consider more specific error handling or re-throwing a custom error
    throw error;
  }
};

// Removed getInterpretation function as backend endpoint /interpret does not exist
// Interpretation is handled client-side via useAiInterpreter hook using Gemini API
