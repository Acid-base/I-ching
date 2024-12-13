import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { config } from 'dotenv';
import type { Reading } from '../types';
import { HexagramData } from '../types/hexagram';

// Load environment variables
config();

const MODEL_NAME = 'gemini-1.5-flash-latest';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are an expert I Ching consultant with deep knowledge of Chinese philosophy, 
symbolism, and divination practices. Your role is to provide insightful interpretations of I Ching readings
that are both profound and practical.`;

const ENHANCED_PROMPT = `You are a master I Ching scholar and interpreter. Analyze this hexagram data to provide a unique, in-depth interpretation.`;

const CHAT_PROMPT = `You are an expert I Ching consultant with deep knowledge of Chinese philosophy, 
symbolism, and divination practices.`;

export async function interpretReading(reading: Reading) {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
    Please interpret this I Ching reading:
    
    Primary Hexagram: ${reading.hexagram_number} - ${reading.reading.name} (${reading.reading.chinese})
    Description: ${reading.reading.description}
    Judgment: ${reading.reading.judgment}
    Image: ${reading.reading.image}
    
    ${reading.changing_lines.length > 0 
      ? `Changing Lines: ${reading.changing_lines.join(', ')}` 
      : 'No changing lines'}
    
    ${reading.relating_hexagram 
      ? `Relating Hexagram: ${reading.relating_hexagram.number} - ${reading.relating_hexagram.name} (${reading.relating_hexagram.chinese})
         Description: ${reading.relating_hexagram.description}` 
      : ''}`;

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: prompt }
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating interpretation:', error);
    throw new Error('Failed to generate AI interpretation');
  }
}

export async function getEnhancedInterpretation(hexagramData: HexagramData) {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
    Provide an enhanced interpretation for this I Ching hexagram:

    Hexagram: ${hexagramData.number} - ${hexagramData.name} (${hexagramData.chinese})
    Element: ${hexagramData.element}
    Attribute: ${hexagramData.attribute}

    Upper Trigram: ${hexagramData.trigrams.upper.name} (${hexagramData.trigrams.upper.chinese})
    - Attribute: ${hexagramData.trigrams.upper.attribute}
    - Element: ${hexagramData.trigrams.upper.element}

    Lower Trigram: ${hexagramData.trigrams.lower.name} (${hexagramData.trigrams.lower.chinese})
    - Attribute: ${hexagramData.trigrams.lower.attribute}
    - Element: ${hexagramData.trigrams.lower.element}

    Judgment:
    ${typeof hexagramData.judgment === 'string' 
      ? hexagramData.judgment 
      : hexagramData.judgment.text}

    Image:
    ${typeof hexagramData.image === 'string'
      ? hexagramData.image
      : hexagramData.image.text}

    Nuclear Hexagram: ${hexagramData.nuclear.upper ? `Upper: ${hexagramData.nuclear.upper}, Lower: ${hexagramData.nuclear.lower}` : 'None'}
    Opposite: ${hexagramData.opposite}
    Reversed: ${hexagramData.reversed || 'None'}

    Line Meanings:
    ${hexagramData.lines.map((line: { number: number; meaning: string }) => 
      `Line ${line.number}: ${line.meaning}`
    ).join('\n')}`;

    const result = await model.generateContent([
      { text: ENHANCED_PROMPT },
      { text: prompt }
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating enhanced interpretation:', error);
    throw new Error('Failed to generate enhanced interpretation');
  }
}

export async function handleChatMessage(content: string) {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const result = await model.generateContent([
      { text: CHAT_PROMPT },
      { text: content }
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in chat message:', error);
    throw new Error('Failed to generate chat response');
  }
}

export async function generateResponse(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: prompt }
    ]);
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

export async function generateHexagramInterpretation(
  hexagramData: HexagramData,
  question: string
): Promise<string> {
  const prompt = `
    Interpret I Ching hexagram ${hexagramData.name} (#${hexagramData.number}) 
    for the question: "${question}"

    Hexagram details:
    ${hexagramData.description}
    ${typeof hexagramData.judgment === 'string' 
      ? hexagramData.judgment 
      : hexagramData.judgment.text}
    ${typeof hexagramData.image === 'string'
      ? hexagramData.image
      : hexagramData.image.text}
    
    Lines:
    ${hexagramData.lines.map(line => `Line ${line.number}: ${line.meaning}`).join('\n')}
  `.trim();

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const result = await model.generateContent([
    { text: ENHANCED_PROMPT },
    { text: prompt }
  ]);
  
  return result.response.text();
}

export async function chatWithHexagram(content: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const result = await model.generateContent([
    { text: CHAT_PROMPT },
    { text: content }
  ]);
  
  return result.response.text();
} 