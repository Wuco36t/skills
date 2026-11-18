import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

it('navigates between screens via the tab bar', async () => {
  render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>)
  expect(screen.getByRole('heading', { name: 'Plan' })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Recipes' }))
  expect(screen.getByRole('heading', { name: 'Recipes' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Recipes' })).toHaveAttribute('aria-current', 'page')
  await userEvent.click(screen.getByRole('button', { name: 'Shopping' }))
  expect(screen.getByRole('heading', { name: 'Shopping' })).toBeInTheDocument()
})
