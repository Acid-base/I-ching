// packages/api/src/types/hexagram.ts
import { z } from 'zod'

export const HexagramSchema = z.object({
  number: z.number(),
  chineseName: z.string(),
  englishName: z.string(),
  pinyin: z.string(),
  structure: z.array(z.string()),
  trigrams: z.object({
    upper: z.string(),
    lower: z.string(),
  }),
  relationships: z.object({
    opposite: z.number(),
    inverse: z.number(),
    nuclear: z.array(z.number()),
    mutual: z.array(z.any()),
  }),
  judgment: z.string(),
  image: z.string(),
  lines: z.array(z.string()),
})

export type Hexagram = z.infer<typeof HexagramSchema>