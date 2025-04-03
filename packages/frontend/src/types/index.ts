import { z } from 'zod';

// Basic schemas
export const TextWithExplanationSchema = z.object({
  text: z.string(),
  explanation: z.string().optional(),
});

export const TrigramSchema = z.object({
  name: z.string(),
  chinese: z.string(),
  attribute: z.string(),
  element: z.string(),
  lines: z.array(z.number()).optional(), // Adding lines property to fix errors
});

export const NuclearDataSchema = z.object({
  hexagram: z.number().nullable(),
  line: z.number().nullable(),
});

export const HexagramDataSchema = z.object({
  number: z.number(),
  name: z.string(),
  englishName: z.string(),
  chinese: z.string(),
  description: z.string(),
  element: z.string().default('N/A'),
  attribute: z.string().default('N/A'),
  judgment: TextWithExplanationSchema,
  image: TextWithExplanationSchema,
  nuclear: NuclearDataSchema,
  lines: z.array(z.string()),
  trigrams: z.record(TrigramSchema),
});

export const ReadingResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    hexagram_number: z.number(),
    changing_lines: z.array(z.number()),
    lines: z.array(z.number()),
    reading: HexagramDataSchema,
    interpretation: z.string().optional(),
    relating_hexagram: HexagramDataSchema.optional(), // Adding missing field
  }),
});

// Chat message schema that was referenced but not defined
export const ChatMessageSchema = z.object({
  role: z.string(),
  content: z.string(),
});

// Export types
export type TextWithExplanation = z.infer<typeof TextWithExplanationSchema>;
export type Trigram = z.infer<typeof TrigramSchema>;
export type TrigramData = z.infer<typeof TrigramSchema>; // Add TrigramData type
export type NuclearData = z.infer<typeof NuclearDataSchema>; // Add NuclearData type
export type HexagramData = z.infer<typeof HexagramDataSchema>;
export type ReadingResponse = z.infer<typeof ReadingResponseSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// Add additional types needed by other files
export enum HexagramMode {
  YARROW = 'yarrow',
  COINS = 'coins'  // Changed from COIN to COINS to match backend
}

// Export Reading schema for those files that import it
export type Reading = HexagramData;
export type ReadingSchema = typeof HexagramDataSchema;
