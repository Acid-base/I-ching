// Reading types
export interface Reading {
  id?: string;
  timestamp?: string;
  hexagram_number: number;
  changing_lines: number[];
  lines: string[];
  reading: {
    number: number;
    name: string;
    chinese?: string;
    judgment: string;
    image: string;
    lines: Array<{
      lineNumber: number;
      meaning: string;
    }>;
  };
  relating_hexagram?: {
    number: number;
    name: string;
    chinese?: string;
    judgment: string;
    image: string;
  };
}

export interface ReadingWithId extends Reading {
  id: string;
  timestamp: string;
}

export interface ReadingsHistoryProps {
  onSelectReading: (reading: ReadingWithId) => void;
}

export default Reading;
