// Export all types from individual files
export * from './hexagram';
export * from './reading';

// Add the isValidDivinationMethod function that was referenced in hexagramService.ts
export const HexagramMode = {
  YARROW: 'yarrow',
  COINS: 'coins',
  COIN: 'coin', // For backward compatibility
} as const;

export type HexagramMode = (typeof HexagramMode)[keyof typeof HexagramMode];

export const isValidDivinationMethod = (mode: string): mode is HexagramMode => {
  return Object.values(HexagramMode).includes(mode as HexagramMode);
};
