import { z } from "zod";

// Enum for hexagram lines
export const HexagramLineEnum = z.enum([
  "yin",
  "yang",
  "changing_yin",
  "changing_yang",
]);

// Type derived from the enum
export type HexagramLine = z.infer<typeof HexagramLineEnum>;

// Hexagram schema
export const HexagramSchema = z.object({
  number: z.number().int().positive().max(64),
  name: z.string().min(1),
  lines: z.array(HexagramLineEnum).length(6),
  related_hexagram: z.number().int().positive().max(64).nullable().optional(),
});

// Type derived from the hexagram schema
export type Hexagram = z.infer<typeof HexagramSchema>;

// Reading schema
export const ReadingSchema = z.object({
  id: z.string(),
  timestamp: z.string().datetime().or(z.date()),
  hexagram: HexagramSchema,
  question: z.string().nullable().optional(),
  interpretation: z.string().nullable().optional(),
});

// Type derived from the reading schema
export type Reading = z.infer<typeof ReadingSchema>;

// Example of form validation schema for creating a reading
export const CreateReadingSchema = z.object({
  question: z
    .string()
    .min(1, "Please enter your question")
    .max(500, "Question is too long"),
  method: z.enum(["coins", "yarrow_stalks", "manual"]),
  lines: z.array(HexagramLineEnum).length(6).optional(),
});

export type CreateReadingInput = z.infer<typeof CreateReadingSchema>;

// Example of a response validation schema
export const ReadingResponseSchema = z.object({
  success: z.boolean(),
  data: ReadingSchema.optional(),
  error: z.string().optional(),
});

export type ReadingResponse = z.infer<typeof ReadingResponseSchema>;
