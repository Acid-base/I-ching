export interface HexagramReading {
  name: string;
  chinese: string;
  description: string;
  judgment: string;
  image: string;
  lines: Record<string, string>;
}

export interface RelatingHexagram {
  number: number;
  name: string;
  chinese: string;
  description: string;
}

export interface Reading {
  hexagram_number: number;
  changing_lines: number[];
  lines: number[];
  reading: HexagramReading;
  relating_hexagram: RelatingHexagram | null;
}

export interface ReadingResponse extends Reading {
  ai_interpretation?: string;
} 