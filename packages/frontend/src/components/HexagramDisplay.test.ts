import { assertEquals } from "https://deno.land/std@0.211.0/assert/mod.ts"
import { renderWithProviders } from "../test/test-utils.ts"
import { HexagramDisplay } from "./HexagramDisplay.tsx"

Deno.test("HexagramDisplay", async (t) => {
  await t.step("renders all lines", () => {
    const lines = [1, 1, 0, 0, 1, 0]
    const changingLines = [3, 6]
    
    const { container } = renderWithProviders(
      <HexagramDisplay lines={lines} changingLines={changingLines} />
    )
    
    const lineElements = container.querySelectorAll("[data-testid^='line-']")
    assertEquals(lineElements.length, 6)
  })
}) 