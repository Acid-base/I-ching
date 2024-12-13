export interface HexagramLine {
  number: number
  value: number
  meaning: string
  transforms_to?: number | null
}

export interface Trigram {
  name: string
  attribute: string
  chinese: string
  element: string
  image: string
}

export interface TextWithExplanation {
  text: string
  explanation: string
}

export interface HexagramData {
  number: number
  name: string
  chinese: string
  pinyin?: string
  description: string
  alternate_names: string[]
  element: string
  attribute: string
  judgment: TextWithExplanation | string
  image: TextWithExplanation | string
  nuclear: {
    upper: number | null
    lower: number | null
  }
  reversed: number | null
  opposite: number
  lines: HexagramLine[]
  trigrams: {
    upper: Trigram
    lower: Trigram
  }
} 