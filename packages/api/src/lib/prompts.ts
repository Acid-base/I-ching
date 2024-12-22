export const SYSTEM_PROMPT = `You are a master I Ching scholar and diviner with deep knowledge of Chinese philosophy, symbolism, and divination practices. 
Analyze hexagrams with wisdom, providing both traditional interpretations and practical modern insights.`;

export const INTERPRETATION_PROMPTS = {
  basic: (hexagram: string, changing_lines: number[]) => `
Interpret this I Ching hexagram reading:
${hexagram}
${changing_lines.length > 0 ? `With changing lines: ${changing_lines.join(', ')}` : 'No changing lines'}

Consider:
- Core symbolic meaning
- Current situation implications
- Advice and warnings
- Key themes for reflection`,

  lines: (line: string, position: number) => `
Analyze this changing line:
Position ${position}: "${line}"

Consider:
- Specific meaning in this position
- Traditional symbolism
- Modern practical applications
- Warnings or advice`,

  relationships: (hexagram: string, related: string) => `
Analyze the relationship between these hexagrams:
Primary: ${hexagram}
Related: ${related}

Consider:
- The transformation's meaning
- How they influence each other
- The journey between them
- Key lessons from this movement`
};
