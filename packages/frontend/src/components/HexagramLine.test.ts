import { render } from '@testing-library/react'
import { HexagramLine } from './HexagramLine'

describe('HexagramLine', () => {
  it('renders a solid line for yang (1)', () => {
    const { container } = render(
      <HexagramLine value={1} isChanging={false} position={1} />
    )
    expect(container.querySelector('[data-testid="line-1"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="line-1-solid"]')).toBeInTheDocument()
  })

  it('renders a broken line for yin (0)', () => {
    const { container } = render(
      <HexagramLine value={0} isChanging={false} position={1} />
    )
    expect(container.querySelector('[data-testid="line-1"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="line-1-broken"]')).toBeInTheDocument()
  })
})