import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TabBar } from './TabBar'

describe('TabBar', () => {
  it('renders three tabs and marks the active one with aria-current="page"', () => {
    render(<TabBar active="recipes" onChange={() => {}} />)
    expect(screen.getAllByRole('button')).toHaveLength(3)
    expect(screen.getByRole('button', { name: 'Plan' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('button', { name: 'Recipes' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Shopping' })).not.toHaveAttribute('aria-current')
  })

  it("calls onChange with 'shopping' when Shopping is clicked", async () => {
    const onChange = vi.fn()
    render(<TabBar active="plan" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Shopping' }))
    expect(onChange).toHaveBeenCalledWith('shopping')
  })
})
