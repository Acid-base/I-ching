import { OpenAPIV3 } from "npm:openapi-types@12.1.3"

export const openApiSpec: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "I Ching API",
    version: "1.0.0",
    description: "API for generating and interpreting I Ching readings",
  },
  servers: [
    {
      url: "http://localhost:8000",
      description: "Development server",
    },
  ],
  paths: {
    "/api/reading": {
      post: {
        summary: "Generate a new I Ching reading",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  hexagram_number: {
                    type: "number",
                    description: "The hexagram number (1-64)",
                  },
                  changing_lines: {
                    type: "array",
                    items: {
                      type: "number",
                    },
                    description: "Array of changing line positions",
                  },
                  lines: {
                    type: "array",
                    items: {
                      type: "number",
                    },
                    description: "Array of line values (0 or 1)",
                  },
                },
                required: ["hexagram_number", "changing_lines", "lines"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Successful reading generation",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reading: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        chinese: { type: "string" },
                        description: { type: "string" },
                        judgment: { type: "string" },
                        image: { type: "string" },
                        lines: {
                          type: "object",
                          additionalProperties: { type: "string" },
                        },
                      },
                    },
                    ai_interpretation: { type: "string" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid request parameters",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}

// Update the API server to serve the OpenAPI documentation
import { serve } from "https://deno.land/std@0.211.0/http/server.ts"
import { swaggerUI } from "npm:swagger-ui-express@5.0.0"

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(openApiSpec)) 