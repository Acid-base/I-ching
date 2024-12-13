interface TrigramData {
  name: string
  chinese: string
  attribute: string
  element: string
  image: string
}

// Using a const assertion for better type inference
export const TRIGRAMS = {
  '111': {
    name: 'Ch\'ien',
    chinese: '乾',
    attribute: 'Strong',
    element: 'Heaven',
    image: 'Heaven'
  },
  '000': {
    name: 'K\'un',
    chinese: '坤',
    attribute: 'Receptive',
    element: 'Earth',
    image: 'Earth'
  },
  '100': {
    name: 'Chen',
    chinese: '震',
    attribute: 'Arousing',
    element: 'Thunder',
    image: 'Thunder'
  },
  '010': {
    name: 'K\'an',
    chinese: '坎',
    attribute: 'Abysmal',
    element: 'Water',
    image: 'Water'
  },
  '001': {
    name: 'Ken',
    chinese: '艮',
    attribute: 'Still',
    element: 'Mountain',
    image: 'Mountain'
  },
  '110': {
    name: 'Li',
    chinese: '離',
    attribute: 'Clinging',
    element: 'Fire',
    image: 'Fire'
  },
  '011': {
    name: 'Tui',
    chinese: '兌',
    attribute: 'Joyous',
    element: 'Lake',
    image: 'Lake'
  },
  '101': {
    name: 'Sun',
    chinese: '巽',
    attribute: 'Gentle',
    element: 'Wind',
    image: 'Wind/Wood'
  }
} as const;

export type TrigramKey = keyof typeof TRIGRAMS;

export function getTrigramData(lines: number[]): TrigramData | undefined {
  const key = lines.join('') as TrigramKey;
  return TRIGRAMS[key];
}

export function splitHexagramToTrigrams(lines: number[]): [number[], number[]] {
  if (lines.length !== 6) {
    throw new Error('Hexagram must have exactly 6 lines');
  }
  const upperTrigram = lines.slice(0, 3);
  const lowerTrigram = lines.slice(3);
  return [upperTrigram, lowerTrigram];
}