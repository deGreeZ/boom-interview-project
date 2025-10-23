import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import NotFound from '~/pages/NotFound'

describe('NotFound', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
  }

  it('renders 404 heading', () => {
    renderWithRouter(<NotFound />)

    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument()
  })

  it('renders "Page Not Found" heading', () => {
    renderWithRouter(<NotFound />)

    expect(screen.getByRole('heading', { name: 'Page Not Found' })).toBeInTheDocument()
  })

  it('renders descriptive message', () => {
    renderWithRouter(<NotFound />)

    expect(
      screen.getByText("The page you're looking for doesn't exist.")
    ).toBeInTheDocument()
  })

  it('renders link to go back home', () => {
    renderWithRouter(<NotFound />)

    const homeLink = screen.getByRole('link', { name: 'Go back home' })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('applies correct CSS class to container', () => {
    const { container } = renderWithRouter(<NotFound />)

    expect(container.querySelector('.not-found')).toBeInTheDocument()
  })

  it('applies correct CSS class to home link', () => {
    renderWithRouter(<NotFound />)

    const homeLink = screen.getByRole('link', { name: 'Go back home' })
    expect(homeLink).toHaveClass('home-link')
  })
})
