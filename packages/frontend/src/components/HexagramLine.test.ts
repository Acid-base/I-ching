import { describe, it, expect } from "https://deno.land/std@0.211.0/testing/bdd.ts"
import { renderWithProviders } from "../test/test-utils.ts"
import { HexagramLine } from "./HexagramLine.tsx"

describe('HexagramLine', () => {
  it('renders a solid line when filled is true', () => {
    const { getByTestId } = renderWithProviders(<HexagramLine filled={true} changing={false} />)
    const line = getByTestId('hexagram-line')
    expect(line.getAttribute('data-filled')).toBe('true')
  })

  it('renders a broken line when filled is false', () => {
    const { getByTestId } = renderWithProviders(<HexagramLine filled={false} changing={false} />)
    const line = getByTestId('hexagram-line')
    expect(line.getAttribute('data-filled')).toBe('false')
  })

  it('shows changing state when changing prop is true', () => {
    const { getByTestId } = renderWithProviders(<HexagramLine filled={true} changing={true} />)
    const line = getByTestId('hexagram-line')
    expect(line.getAttribute('data-changing')).toBe('true')
  })
}) 