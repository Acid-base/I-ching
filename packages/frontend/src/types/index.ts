import { z } from 'zod'

export const TrigramSchema = z.object({
  name: z.string(),
  meaning: z.string(),
  image: z.string(),
  family: z.string(),
  attribute: z.string(),
})

export const TrigramsSchema = z.object({
  upper: z.string(),
  lower: z.string()
})

export const HexagramDataSchema = z.object({
    number: z.number(),
    chineseName: z.string(),
    englishName: z.string(),
    pinyin: z.string(),
    structure: z.array(z.string()),
    trigrams: z.object({
        upper: z.string(),
        lower: z.string()
    }),
    relationships: z.record(z.union([z.number(), z.array(z.number())])),
    judgment: z.string(),
    image: z.string(),
    lines: z.array(z.string())
})

export const ReadingResponseSchema = z.object({
  hexagram_number: z.number(),
  changing_lines: z.array(z.number()),
  lines: z.array(z.string()),
  reading: HexagramDataSchema,
  relating_hexagram: HexagramDataSchema.nullable()
})

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string()
})

export type Trigram = z.infer<typeof TrigramSchema>
export type Trigrams = z.infer<typeof TrigramsSchema>
export type HexagramData = z.infer<typeof HexagramDataSchema>
export type ReadingResponse = z.infer<typeof ReadingResponseSchema>
export type ChatMessage = z.infer<typeof ChatMessageSchema>