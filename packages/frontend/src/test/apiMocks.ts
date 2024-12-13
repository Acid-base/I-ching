import { rest } from "npm:msw@2.2.1"
import { setupServer } from "npm:msw/node@2.2.1"

// Define handlers
export const handlers = [
  rest.post('/api/reading', (req, res, ctx) => {
    return res(
      ctx.json({
        hexagram_number: 1,
        changing_lines: [3, 6],
        lines: [1, 1, 0, 0, 1, 0],
        reading: {
          name: "Test Hexagram",
          chinese: "测试",
          description: "Test description",
          judgment: "Test judgment",
          image: "Test image",
          lines: {
            "3": "Line 3 meaning",
            "6": "Line 6 meaning"
          }
        }
      })
    )
  }),
]

// Setup MSW Server
export const server = setupServer(...handlers) 