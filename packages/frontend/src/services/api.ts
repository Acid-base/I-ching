import axios from "axios";
import { HexagramReading } from "../types/hexagram";

// Define API base URL - adjust according to your backend setup
// First try the backend URL from environment, then fallback to relative paths which work better in development
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Added timeout to prevent long waits when server is unreachable
  timeout: 10000,
});

// Mock responses for development when backend is unavailable
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === "true" || false;

// Mock data for hexagram casting
const MOCK_HEXAGRAM_RESPONSE = {
  hexagram_number: 1,
  lines: ["---", "---", "---", "---", "---", "---"],
  changing_lines: [],
  reading: {
    number: 1,
    name: "The Creative (Qian)",
    description:
      "The Creative represents pure yang energy - strength, creativity, and perseverance.",
    judgment:
      "The Creative works sublime success, furthering through perseverance.",
    image:
      "The movement of heaven is full of power. Thus the superior person makes himself strong and untiring.",
    trigrams: {
      upper: "Heaven",
      lower: "Heaven",
    },
  },
  relating_hexagram: null,
  interpretation:
    "The Creative represents the pure creative principle, symbolizing strength, energy, and persistence. This hexagram suggests a time of great potential and the opportunity to achieve significant goals through determined action.",
};

// API endpoints
export const castHexagram = async (
  question: string = "What does the universe want me to know today?"
): Promise<HexagramReading> => {
  try {
    // Use mock data if enabled or in development with no server
    if (USE_MOCK_DATA) {
      console.log("Using mock hexagram data");
      return MOCK_HEXAGRAM_RESPONSE;
    }

    console.log("Casting hexagram with question:", question);
    const response = await api.post("/cast", {
      question,
      mode: "yarrow_stalks",
      verbose: true,
    });
    console.log("Received hexagram response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error casting hexagram:", error);

    // If server is unreachable in development, return mock data as fallback
    if (
      import.meta.env.DEV &&
      (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED")
    ) {
      console.warn("Backend server unreachable, using mock data as fallback");
      return MOCK_HEXAGRAM_RESPONSE;
    }

    // Otherwise rethrow the error
    throw error;
  }
};

export const getReading = async (id: string) => {
  try {
    const response = await api.get(`/readings/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching reading ${id}:`, error);
    throw error;
  }
};

export const getReadings = async () => {
  try {
    const response = await api.get("/readings");
    return response.data;
  } catch (error) {
    console.error("Error fetching readings:", error);
    throw error;
  }
};

export default {
  castHexagram,
  getReading,
  getReadings,
};
