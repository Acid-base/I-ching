import { z } from 'zod'

export const TrigramSchema = z.object({
  name: z.string(),
  attribute: z.string(),
  chinese: z.string(),
  element: z.string(),
  image: z.string()
})

export const TrigramsSchema = z.object({
  upper: TrigramSchema,
  lower: TrigramSchema
})

export const JudgmentSchema = z.object({
  text: z.string(),
  explanation: z.string()
})

export const ImageSchema = z.object({
  text: z.string(),
  explanation: z.string()
})

export const LineSchema = z.object({
  number: z.number(),
  value: z.number(),
  meaning: z.string(),
  explanation: z.string().optional(),
  transforms_to: z.number().nullable()
})

export const NuclearSchema = z.object({
  upper: z.number().nullable(),
  lower: z.number().nullable()
})

export const HexagramReadingSchema = z.object({
  number: z.number(),
  name: z.string(),
  chinese: z.string(),
  pinyin: z.string(),
  description: z.string(),
  alternate_names: z.array(z.string()),
  element: z.string(),
  attribute: z.string(),
  judgment: JudgmentSchema,
  image: ImageSchema,
  nuclear: NuclearSchema,
  reversed: z.number().nullable(),
  opposite: z.number(),
  lines: z.array(LineSchema),
  trigrams: TrigramsSchema
})

export const RelatingHexagramSchema = z.object({
  number: z.number(),
  name: z.string(),
  chinese: z.string(),
  description: z.string(),
  alternate_names: z.array(z.string()),
  element: z.string(),
  attribute: z.string(),
  judgment: z.string(),
  image: z.string(),
  nuclear: NuclearSchema,
  reversed: z.number(),
  opposite: z.number(),
  lines: z.array(LineSchema),
  line_context: z.record(z.string(), z.string())
})

export const ReadingSchema = z.object({
  hexagram_number: z.number(),
  changing_lines: z.array(z.number()),
  lines: z.array(z.number()),
  reading: HexagramReadingSchema,
  relating_hexagram: RelatingHexagramSchema.nullable(),
  ai_interpretation: z.string().optional()
})

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string()
})

export type Trigram = z.infer<typeof TrigramSchema>
export type Trigrams = z.infer<typeof TrigramsSchema>
export type Judgment = z.infer<typeof JudgmentSchema>
export type Image = z.infer<typeof ImageSchema>
export type Line = z.infer<typeof LineSchema>
export type Nuclear = z.infer<typeof NuclearSchema>
export type HexagramReading = z.infer<typeof HexagramReadingSchema>
export type RelatingHexagram = z.infer<typeof RelatingHexagramSchema>
export type Reading = z.infer<typeof ReadingSchema>
export type ChatMessage = z.infer<typeof ChatMessageSchema> 