export interface Trigram {
  name: string;
  meaning: string;
  image: string;
  family: string;
  attribute: string;
}

export interface LineInfo {
  lineNumber: number;
  type: 'yang' | 'yin';
  meaning: string;
}

export interface TrigramSignificance {
  upper: string;
  lower: string;
  relationship: string;
}

export interface HexagramData {
  number: number;
  name: string;
  chineseName: string;
  pinyin?: string;
  englishName?: string;
  chinese?: string;
  description?: string;
  judgment: string | { text?: string };
  image: string | { text?: string };
  lines?: LineInfo[];
  upperTrigram?: string;
  lowerTrigram?: string;
  trigramSignificance?: TrigramSignificance;
  commentary?: string[];
}

export interface ReadingResponse {
  hexagram_number: number;
  changing_lines: number[];
  lines: string[];
  reading: HexagramData;
  relating_hexagram?: HexagramData | null;
}

export interface Hexagram {
  number: number;
  name: string;
  chinese: string;
  description: string;
  judgment: {
    text: string;
    explanation?: string;
  };
  image: {
    text: string;
    explanation?: string;
  };
  lines: string[];
  trigrams: {
    upper: string;
    lower: string;
  };
}

export interface HexagramLine {
  position: number;
  value: number;
  isChanging: boolean;
  text?: string;
}

export type HexagramMode = 'yarrow' | 'coin' | 'random';
