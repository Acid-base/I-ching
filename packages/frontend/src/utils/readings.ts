import {
  ReadingSchema,
  type Reading,
  type ReadingResponse,
} from "../schemas/hexagram";

/**
 * Validates and parses API responses containing hexagram readings
 * @param data - The data to validate against the Reading schema
 * @returns The validated and parsed Reading object
 * @throws Error if validation fails
 */
export function validateReading(data: unknown): Reading {
  try {
    return ReadingSchema.parse(data);
  } catch (error) {
    console.error("Reading validation error:", error);
    throw new Error("Invalid reading data format");
  }
}

/**
 * Fetches a reading from the API and validates the response
 * @param id - The ID of the reading to fetch
 * @returns The validated reading
 */
export async function fetchReading(id: string): Promise<Reading> {
  try {
    const response = await fetch(`/api/readings/${id}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return validateReading(data);
  } catch (error) {
    console.error("Error fetching reading:", error);
    throw error;
  }
}

/**
 * Creates a new reading via the API
 * @param question - The question for the reading
 * @returns The created reading data
 */
export async function createReading(
  question: string
): Promise<ReadingResponse> {
  try {
    const response = await fetch("/api/readings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        method: "coins",
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating reading:", error);
    throw error;
  }
}
