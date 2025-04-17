import { type ReadingResponse } from '@/types';
import { generateReading } from '@services/api';
import axios from 'axios';
import { useState } from 'react';

// Define HexagramMode type locally to avoid issues
type HexagramMode = 'yarrow' | 'coins';

// Configure axios defaults
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
axios.defaults.timeout = 10000; // 10 seconds timeout

// Storage key constants
const CURRENT_READING_KEY = 'iching_current_reading';
const SAVED_READINGS_KEY = 'iching_saved_readings';

export function useReading() {
  const [reading, setReading] = useState<ReadingResponse | null>(() => {
    // Try to load the current reading from localStorage on initial mount
    const savedReading = localStorage.getItem(CURRENT_READING_KEY);
    return savedReading ? JSON.parse(savedReading) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<HexagramMode>('yarrow');

  // Save a reading to localStorage history
  const saveReadingToHistory = (readingData: ReadingResponse) => {
    try {
      // Get existing saved readings
      const savedReadingsStr = localStorage.getItem(SAVED_READINGS_KEY);
      const savedReadings = savedReadingsStr ? JSON.parse(savedReadingsStr) : [];

      // Add new reading with timestamp
      const newSavedReading = {
        timestamp: Date.now(),
        reading: readingData,
      };

      // Add to array and save back to localStorage
      savedReadings.push(newSavedReading);
      localStorage.setItem(SAVED_READINGS_KEY, JSON.stringify(savedReadings));
    } catch (err) {
      console.error('Error saving reading to history:', err);
    }
  };

  const generate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await generateReading(mode);

      // Save to state and localStorage
      setReading(data);
      localStorage.setItem(CURRENT_READING_KEY, JSON.stringify(data));

      // Save to reading history
      saveReadingToHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate reading');
      console.error('Error generating reading:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const changeCastingMode = (newMode: HexagramMode) => {
    setMode(newMode);
  };

  // Load a specific reading (e.g., from history)
  const loadReading = (readingData: ReadingResponse) => {
    setReading(readingData);
    localStorage.setItem(CURRENT_READING_KEY, JSON.stringify(readingData));
  };

  // Clear the current reading
  const clearReading = () => {
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
  };
}
