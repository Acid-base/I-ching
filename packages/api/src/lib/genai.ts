import { GoogleGenerativeAI } from '@google/generative-ai';
import { HexagramData } from '../types/hexagram';
import { SYSTEM_PROMPT, INTERPRETATION_PROMPTS } from './prompts';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

export async function interpretHexagram(hexagram: HexagramData, changingLines: number[] = []) {
  const prompt = INTERPRETATION_PROMPTS.basic(
    `${hexagram.englishName} (${hexagram.chinese})\n${hexagram.judgment}`,
    changingLines
  );

  const result = await model.generateContent([
    { text: SYSTEM_PROMPT },
    { text: prompt }
  ]);

  return result.response.text();
}

export async function interpretChangingLines(hexagram: HexagramData, lineNumbers: number[]) {
  const interpretations = await Promise.all(
    lineNumbers.map(async (num) => {
      const prompt = INTERPRETATION_PROMPTS.lines(
        hexagram.lines[num - 1],
        num
      );

      const result = await model.generateContent([
        { text: SYSTEM_PROMPT },
        { text: prompt }
      ]);

      return {
        position: num,
        interpretation: result.response.text()
      };
    })
  );

  return interpretations;
}

export async function interpretRelationship(
  primary: HexagramData,
  relating: HexagramData
) {
  const prompt = INTERPRETATION_PROMPTS.relationships(
    `${primary.englishName} (${primary.chinese})`,
    `${relating.englishName} (${relating.chinese})`
  );

  const result = await model.generateContent([
    { text: SYSTEM_PROMPT },
    { text: prompt }
  ]);

  return result.response.text();
}
