export interface Trigram {
  name: string;
  meaning: string;
  image: string;
  family: string;
  attribute: string;
}

export interface HexagramData {
  number: number;
  chineseName: string;
  englishName: string;
  pinyin: string;
  structure: string[];
  trigrams: {
    upper: string;
    lower: string;
  };
  relationships: {
    [key: string]: number | number[];
  };
  judgment: string;
  image: string;
  lines: string[];
}

export interface ReadingResponse {
  hexagram_number: number;
  changing_lines: number[];
  lines: string[];
  reading: HexagramData;
  relating_hexagram: HexagramData | null;
}