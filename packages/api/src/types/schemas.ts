 import { z } from 'zod';

 export const MessageSchema = z.object({
   role: z.enum(['user', 'assistant']),
   content: z.string()
 });

 export const HexagramSchema = z.object({
   number: z.number(),
   name: z.string(),
   chinese: z.string(),
   description: z.string(),
   alternate_names: z.array(z.string()),
   element: z.string(),
   attribute: z.string(),
   judgment: z.union([
     z.string(),
     z.object({
       text: z.string(),
       explanation: z.string()
     })
   ]),
   image: z.union([
     z.string(),
     z.object({
       text: z.string(),
       explanation: z.string()
     })
   ]),
   nuclear: z.object({
     upper: z.number().nullable(),
     lower: z.number().nullable()
   }),
   reversed: z.number().nullable(),
   opposite: z.number(),
   lines: z.array(z.object({
     number: z.number(),
     value: z.number(),
     meaning: z.string(),
     transforms_to: z.number().nullable().optional()
   })),
   trigrams: z.object({
     upper: z.object({
       name: z.string(),
       attribute: z.string(),
       chinese: z.string(),
       element: z.string(),
       image: z.string()
     }),
     lower: z.object({
       name: z.string(),
       attribute: z.string(),
       chinese: z.string(),
       element: z.string(),
       image: z.string()
     })
   })
 });
