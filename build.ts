import * as esbuild from "esbuild"
import { denoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.8.5/mod.ts"

// Ensure dist directory exists
await Deno.mkdir("dist", { recursive: true })

// Copy index.html to dist
await Deno.copyFile("index.html", "dist/index.html")

// Bundle the application
await esbuild.build({
  entryPoints: ["src/index.tsx"],
  bundle: true,
  outfile: "dist/app.js",
  format: "esm",
  platform: "browser",
  plugins: [...denoPlugins()],
  jsxFactory: "React.createElement",
  jsxFragment: "React.Fragment",
  minify: true,
  sourcemap: true,
  target: ["chrome99", "firefox99", "safari15"],
  external: [
    "react",
    "react-dom",
    "@chakra-ui/react",
    "@emotion/react",
    "@emotion/styled",
    "@tanstack/react-query",
    "axios",
    "framer-motion",
  ],
})

console.log("Build complete") 