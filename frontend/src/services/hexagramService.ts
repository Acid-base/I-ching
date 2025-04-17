import axios from "axios";

// Define response type for the API
export interface HexagramData {
  number: number;
  name: string;
  description: string;
  image: string;
  chinese?: string;
  judgment?: string;
  lines?: any[];
}

export interface ReadingResponse {
  reading: HexagramData;
  relating_hexagram?: HexagramData;
  hexagram_number?: number; // Legacy support
  changing_lines?: number[];
  changing_line_indices?: number[];
  lines?: number[];
  cast_result?: {
    lines: number[];
    changing_line_indices: number[];
    primary_hexagram_number: number;
    transformed_lines?: number[];
    transformed_hexagram_number?: number;
  };
  question?: string;
  interpretation?: string;
  wisdom?: string;
}

export interface InterpretationResponse {
  interpretation: string;
  wisdom: string;
}

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: "/api", // Use the Vite proxy configuration
  timeout: 15000, // 15 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

export interface CastRequest {
  mode: "yarrow" | "coins";
  verbose?: boolean;
  seed?: number;
}

export interface Trigram {
  name: string;
  value: number;
}

// Helper to generate a random hexagram number (1-64)
const getRandomHexagramNumber = () => Math.floor(Math.random() * 64) + 1;

// Updated local fallback generation
const generateLocalFallback = (mode: "yarrow" | "coins"): ReadingResponse => {
  console.warn(`Generating local fallback reading using ${mode} method.`);

  const lines: number[] = [];
  for (let i = 0; i < 6; i++) {
    const rand = Math.random();
    if (mode === "yarrow") {
      // Approximate Yarrow Probabilities:
      // 9 (Old Yang): 3/16 = 0.1875
      // 7 (Young Yang): 5/16 = 0.3125
      // 8 (Young Yin): 7/16 = 0.4375
      // 6 (Old Yin): 1/16 = 0.0625
      if (rand < 0.1875) lines.push(9);
      else if (rand < 0.1875 + 0.3125) lines.push(7);
      else if (rand < 0.1875 + 0.3125 + 0.4375) lines.push(8);
      else lines.push(6);
    } else {
      // Coin Probabilities (equal chance):
      // 9 (Old Yang): 1/4 = 0.25
      // 7 (Young Yang): 1/4 = 0.25
      // 8 (Young Yin): 1/4 = 0.25
      // 6 (Old Yin): 1/4 = 0.25
      if (rand < 0.25) lines.push(9);
      else if (rand < 0.5) lines.push(7);
      else if (rand < 0.75) lines.push(8);
      else lines.push(6);
    }
  }

  const changing_line_indices = lines
    .map((line, index) => (line === 6 || line === 9 ? index : -1))
    .filter((index) => index !== -1);

  const primary_hexagram_number = getRandomHexagramNumber(); // Simulate getting number

  const cast_result: ReadingResponse["cast_result"] = {
    lines,
    changing_line_indices,
    primary_hexagram_number,
  };

  const primary_hexagram: ReadingResponse["reading"] = {
    number: primary_hexagram_number,
    name: `Fallback Hexagram ${primary_hexagram_number}`,
    chinese: "易經",
    judgment:
      "Local fallback: API connection failed. This is a simulated reading.",
    image: "When the connection is lost, rely on inner resources.",
    lines: [], // Simplified fallback
  };

  let transformed_hexagram: ReadingResponse["relating_hexagram"] | undefined =
    undefined;
  if (changing_line_indices.length > 0) {
    const transformed_lines = lines.map((line) =>
      line === 6 ? 7 : line === 9 ? 8 : line,
    );
    const transformed_hexagram_number = getRandomHexagramNumber(); // Simulate
    cast_result.transformed_lines = transformed_lines;
    cast_result.transformed_hexagram_number = transformed_hexagram_number;
    transformed_hexagram = {
      number: transformed_hexagram_number,
      name: `Fallback Transformed Hexagram ${transformed_hexagram_number}`,
      judgment: "Simulated relating hexagram due to API failure.",
      image: "Change reveals new perspectives.",
      lines: [], // Simplified fallback
    };
  }

  // Construct the full ReadingResponse object matching the expected structure
  return {
    // These top-level fields might be deprecated if components use nested structure
    hexagram_number: primary_hexagram_number,
    changing_line_indices: changing_line_indices,
    lines: lines, // Keep for backward compatibility if needed

    // Nested structure matching backend
    cast_result: cast_result,
    reading: primary_hexagram, // Corresponds to primary_hexagram from backend
    relating_hexagram: transformed_hexagram, // Corresponds to transformed_hexagram
  };
};

// Services for I Ching hexagram operations
export const hexagramService = {
  /**
   * Cast a hexagram using the specified method
   */
  async castHexagram(request: CastRequest): Promise<ReadingResponse> {
    try {
      const response = await api.post("/cast", request);
      return response.data;
    } catch (error) {
      console.error("Error casting hexagram:", error);
      throw error;
    }
  },

  /**
   * Get AI interpretation for a hexagram
   */
  async getInterpretation(
    hexagramNumber: number,
    changingLines: number[],
  ): Promise<InterpretationResponse> {
    try {
      const response = await api.post("/interpret", {
        hexagram_number: hexagramNumber,
        changing_lines: changingLines,
      });
      return response.data;
    } catch (error) {
      console.error("Error getting interpretation:", error);
      throw error;
    }
  },

  /**
   * Legacy method for fetching hexagram data - alias for castHexagram
   */
  async fetchHexagram(mode: "yarrow" | "coins"): Promise<ReadingResponse> {
    return this.castHexagram({ mode });
  },
};

// Modified to include fallback mechanism
export const fetchHexagram = async (mode: "yarrow" | "coins") => {
  try {
    console.log(`Attempting to fetch hexagram using ${mode} method from API`);
    const response = await api.post("/cast", {
      mode,
      verbose: false,
    });
    return response.data;
  } catch (error) {
    console.error("Error casting hexagram:", error);
    console.log("Using local fallback due to API connection failure");
    // Return a locally generated fallback reading
    return generateLocalFallback(mode);
  }
};
