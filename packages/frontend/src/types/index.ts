import { z } from 'zod'

// Basic schemas
export const TextWithExplanationSchema = z.object({
  text: z.string(),
  explanation: z.string().optional()
})

export const TrigramSchema = z.object({
  name: z.string(),
  chinese: z.string(),
  attribute: z.string(),
  element: z.string()
})

export const NuclearDataSchema = z.object({
  hexagram: z.number().nullable(),
  line: z.number().nullable()
})

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
  trigrams: z.record(TrigramSchema)
})

export const ReadingResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    hexagram_number: z.number(),
    changing_lines: z.array(z.number()),
    lines: z.array(z.number()),
    reading: HexagramDataSchema,
    interpretation: z.string().optional()
  })
})

// Export types
export type TextWithExplanation = z.infer<typeof TextWithExplanationSchema>
export type Trigram = z.infer<typeof TrigramSchema>
export type HexagramData = z.infer<typeof HexagramDataSchema>
export type ReadingResponse = z.infer<typeof ReadingResponseSchema>
export type ChatMessage = z.infer<typeof ChatMessageSchema>

// Remove duplicate interfaces and update with FastAPI types
export interface HexagramData {
  number: number
  name: string
  englishName: string
  chinese: string
  description: string
  element: string
  attribute: string
  judgment: TextWithExplanation
  image: TextWithExplanation
  nuclear: NuclearData
  lines: string[]
  trigrams: Record<string, TrigramData>
}

export interface ReadingResponse {
  success: boolean
  data: {
    hexagram_number: number
    changing_lines: number[]
    lines: number[]
    reading: HexagramData
    interpretation?: string
  }
}

// Remove duplicate interfaces