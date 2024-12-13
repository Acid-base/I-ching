import { serve } from "https://deno.land/std@0.211.0/http/server.ts"
import { serveDir } from "https://deno.land/std@0.211.0/http/file_server.ts"

const port = 3000

serve(async (req) => {
  const url = new URL(req.url)
  
  // Serve static files from public directory
  if (url.pathname.startsWith("/assets")) {
    return await serveDir(req, {
      fsRoot: "public",
      urlRoot: "assets",
    })
  }

  // Serve index.html for all other routes (SPA)
  return new Response(await Deno.readFile("./index.html"), {
    headers: { "content-type": "text/html; charset=utf-8" },
  })
}, { port })

console.log(`Server running at http://localhost:${port}`) 