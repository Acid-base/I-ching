import { PythonShell } from 'python-shell';
import path from 'path';
import { z } from 'zod';
import readings from '../../../core/src/data/readings.json';

const TextWithExplanationSchema = z.object({
  text: z.string(),
  explanation: z.string()
});

const LineDataSchema = z.object({
  number: z.number(),
  value: z.number(),
  meaning: z.string(),
  transforms_to: z.number().nullable().optional()
});

const TrigramDataSchema = z.object({
  name: z.string(),
  chinese: z.string(),
  pinyin: z.string(),
  attribute: z.string(),
  element: z.string(),
  image: z.string()
});

const HexagramDataSchema = z.object({
  number: z.number(),
  name: z.string(),
  chinese: z.string(),
  pinyin: z.string().optional(),
  description: z.string(),
  alternate_names: z.array(z.string()),
  element: z.string(),
  attribute: z.string(),
  judgment: z.union([
    z.string(),
    TextWithExplanationSchema
  ]),
  image: z.union([
    z.string(),
    TextWithExplanationSchema
  ]),
  nuclear: z.object({
    upper: z.number().nullable(),
    lower: z.number().nullable()
  }),
  reversed: z.number().nullable(),
  opposite: z.number(),
  lines: z.array(LineDataSchema),
  trigrams: z.object({
    upper: TrigramDataSchema,
    lower: TrigramDataSchema
  })
});

const ReadingResponseSchema = z.object({
  hexagram_number: z.number(),
  changing_lines: z.array(z.number()),
  lines: z.array(z.number()),
  reading: HexagramDataSchema,
  relating_hexagram: z.object({
    number: z.number(),
    name: z.string(),
    chinese: z.string(),
    pinyin: z.string().optional(),
    description: z.string(),
    alternate_names: z.array(z.string()).optional(),
    element: z.string(),
    attribute: z.string(),
    judgment: z.union([
      z.string(),
      TextWithExplanationSchema
    ]).optional(),
    image: z.union([
      z.string(),
      TextWithExplanationSchema
    ]).optional(),
    nuclear: z.object({
      upper: z.number().nullable(),
      lower: z.number().nullable()
    }).optional(),
    reversed: z.number().nullable().optional(),
    opposite: z.number().optional(),
    lines: z.array(LineDataSchema).optional(),
    trigrams: z.object({
      upper: TrigramDataSchema,
      lower: TrigramDataSchema
    }).optional()
  }).nullable()
});

const RelatingHexagramSchema = z.object({
  number: z.number(),
  name: z.string(),
  chinese: z.string(),
  pinyin: z.string().optional(),
  description: z.string(),
  alternate_names: z.array(z.string()).optional(),
  element: z.string(),
  attribute: z.string(),
  judgment: z.union([
    z.string(),
    TextWithExplanationSchema
  ]).optional(),
  image: z.union([
    z.string(),
    TextWithExplanationSchema
  ]).optional(),
  nuclear: z.object({
    upper: z.number().nullable(),
    lower: z.number().nullable()
  }).optional(),
  reversed: z.number().nullable().optional(),
  opposite: z.number().optional(),
  lines: z.array(LineDataSchema).optional(),
  trigrams: z.object({
    upper: TrigramDataSchema,
    lower: TrigramDataSchema
  }).optional()
}).strip();

export type HexagramData = z.infer<typeof HexagramDataSchema>;
export type ReadingResponse = z.infer<typeof ReadingResponseSchema>;

// Add validation function
function validateHexagramData() {
  const hexagramNumbers = new Set(readings.map(h => h.number));
  const missing = [];
  
  // Check for missing hexagrams
  for (let i = 1; i <= 64; i++) {
    if (!hexagramNumbers.has(i)) {
      missing.push(i);
    }
  }
  
  if (missing.length > 0) {
    console.error('Missing hexagrams:', missing);
    throw new Error(`Incomplete hexagram data. Missing hexagrams: ${missing.join(', ')}`);
  }
  
  // Validate each hexagram's data structure
  readings.forEach(hexagram => {
    try {
      HexagramDataSchema.parse(hexagram);
    } catch (error) {
      console.error(`Invalid data structure for hexagram ${hexagram.number}:`, error);
      throw new Error(`Invalid data structure for hexagram ${hexagram.number}`);
    }
  });
}

// Call validation on module load
validateHexagramData();

export async function generateReading(): Promise<ReadingResponse> {
  try {
    // Ensure data is valid before generating reading
    validateHexagramData();
    
    // Get the absolute path to the project root
    const projectRoot = path.resolve(__dirname, '../../../..');
    const pythonPath = path.join(projectRoot, 'packages', 'core', 'src');
    const scriptPath = path.join(pythonPath, 'divination.py');
    
    console.log('Project root:', projectRoot);
    console.log('Python script path:', scriptPath);
    
    const options = {
      mode: 'json' as const,
      pythonPath: 'python',
      pythonOptions: ['-u'],
      scriptPath: pythonPath,
      args: [JSON.stringify({ mode: 'yarrow' })],
      stderrParser: (line: string) => {
        console.log('Python stderr:', line);
        return line;
      }
    };

    console.log('Running Python script with options:', options);
    const results = await PythonShell.run('divination.py', options);
    console.log('Python script results:', results);
    
    if (!results || results.length === 0) {
      throw new Error('No results returned from Python script');
    }

    const result = results[0];
    console.log('Parsing result:', result);
    
    // Check if the result is an error response from Python
    if (result.error) {
      throw new Error(`Python script error: ${result.error} (${result.type})`);
    }

    // Validate the response
    const parsed = ReadingResponseSchema.parse(result);
    console.log('Successfully parsed result');
    return parsed;
  } catch (error) {
    console.error('Error generating reading:', error);
    throw error;
  }
}

export async function getHexagramById(id: number): Promise<HexagramData> {
  try {
    // Validate id range
    if (id < 1 || id > 64) {
      throw new Error(`Invalid hexagram ID: ${id}. Must be between 1 and 64.`);
    }
    
    // Find hexagram in validated data
    const hexagram = readings.find(h => h.number === id);
    if (!hexagram) {
      throw new Error(`Hexagram ${id} not found`);
    }
    
    return HexagramDataSchema.parse(hexagram);
  } catch (error) {
    console.error(`Error getting hexagram ${id}:`, error);
    throw error;
  }
} 