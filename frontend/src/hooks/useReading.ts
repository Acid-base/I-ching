import { type ReadingResponse } from "@/types";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { hexagramService } from "../services/hexagramService"; // Import the service

// Define HexagramMode type locally to avoid issues
type HexagramMode = "yarrow" | "coins";

// Configure axios defaults
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
axios.defaults.timeout = 10000; // 10 seconds timeout

// Storage key constants
const CURRENT_READING_KEY = "iching_current_reading";
const SAVED_READINGS_KEY = "iching_saved_readings";

interface SavedReading {
  timestamp: number;
  reading: ReadingResponse;
}

export function useReading() {
  const [reading, setReading] = useState<ReadingResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [mode, setMode] = useState<HexagramMode>("yarrow"); // Default mode

  // Load reading from localStorage on initial mount
  useEffect(() => {
    try {
      const savedReadingJson = localStorage.getItem(CURRENT_READING_KEY);
      if (savedReadingJson) {
        const savedReading = JSON.parse(savedReadingJson) as ReadingResponse;
        // TODO: Add validation here to ensure savedReading matches the expected structure
        setReading(savedReading);
      }
    } catch (err) {
      console.error("Error loading reading from localStorage:", err);
      localStorage.removeItem(CURRENT_READING_KEY); // Clear invalid data
    }
  }, []);

  // Function to save a reading to history
  const saveReadingToHistory = (readingData: ReadingResponse) => {
    try {
      const savedReadingsJson = localStorage.getItem(SAVED_READINGS_KEY);
      const savedReadings: SavedReading[] = savedReadingsJson
        ? JSON.parse(savedReadingsJson)
        : [];

      // Add new reading with timestamp
      const newSavedReading: SavedReading = {
        timestamp: Date.now(),
        reading: readingData,
      };
      savedReadings.unshift(newSavedReading); // Add to the beginning

      // Limit history size (e.g., keep last 20 readings)
      const limitedReadings = savedReadings.slice(0, 20);

      localStorage.setItem(SAVED_READINGS_KEY, JSON.stringify(limitedReadings));
    } catch (err) {
      console.error("Error saving reading to history:", err);
    }
  };

  // Function to generate a new reading
  const generate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log(`Generating reading with mode: ${mode}`);
    try {
      // Use hexagramService to cast
      const data = await hexagramService.castHexagram({ mode });
      console.log("Reading data received:", data);

      // Save to state and localStorage
      setReading(data);
      localStorage.setItem(CURRENT_READING_KEY, JSON.stringify(data));

      // Save to reading history
      saveReadingToHistory(data);
      return data; // Return the generated data
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to generate reading");
      setError(error);
      console.error("Error generating reading:", error);
      // Clear potentially invalid reading from state/storage on error
      setReading(null);
      localStorage.removeItem(CURRENT_READING_KEY);
      throw error; // Re-throw error for handling in UI
    } finally {
      setIsLoading(false);
    }
  }, [mode]); // Dependency on mode

  // Function to change the casting mode
  const changeCastingMode = (newMode: HexagramMode) => {
    console.log(`Changing casting mode to: ${newMode}`);
    setMode(newMode);
  };

  // Load a specific reading (e.g., from history)
  const loadReading = (readingData: ReadingResponse) => {
    console.log("Loading specific reading:", readingData);
    setReading(readingData);
    // Optionally update current reading in localStorage
    localStorage.setItem(CURRENT_READING_KEY, JSON.stringify(readingData));
  };

  // Clear the current reading
  const clearReading = () => {
    console.log("Clearing current reading.");
    setReading(null);
    localStorage.removeItem(CURRENT_READING_KEY);
  };

  return {
    reading,
    isLoading,
    error,
    generate,
    setMode: changeCastingMode,
    loadReading,
    clearReading,
    mode, // Expose current mode if needed
  };
}
