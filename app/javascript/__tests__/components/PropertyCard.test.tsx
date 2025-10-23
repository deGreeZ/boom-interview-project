import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PropertyCard from '~/components/PropertyCard'
import { Property } from '~/components/PropertyCard'

describe('PropertyCard', () => {
  const mockProperty: Property = {
    id: 1,
    name: 'Luxury Downtown Apartment',
    location: 'New York, NY',
    image: 'https://example.com/image.jpg',
    rating: 4.8,
    guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    price: 250,
    nights: 3,
  }

  it('renders property information correctly', () => {
    render(<PropertyCard property={mockProperty} />)

    expect(screen.getByText('Luxury Downtown Apartment')).toBeInTheDocument()
    expect(screen.getByText('New York, NY')).toBeInTheDocument()
    expect(screen.getByText('⭐ 4.8')).toBeInTheDocument()
    expect(screen.getByText(/4 Guests/)).toBeInTheDocument()
    expect(screen.getByText(/2 Bedrooms/)).toBeInTheDocument()
    expect(screen.getByText(/2 Bathrooms/)).toBeInTheDocument()
  })

  it('renders property image with correct alt text', () => {
    render(<PropertyCard property={mockProperty} />)

    const image = screen.getByAltText('Luxury Downtown Apartment')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg')
  })

  it('displays price correctly formatted with dollar sign', () => {
    render(<PropertyCard property={mockProperty} />)

    expect(screen.getByText('$250')).toBeInTheDocument()
  })

  it('displays number of nights correctly', () => {
    render(<PropertyCard property={mockProperty} />)

    expect(screen.getByText(/3 Nights/)).toBeInTheDocument()
  })

  it('displays singular forms when count is 1', () => {
    const singleProperty: Property = {
      ...mockProperty,
      guests: 1,
      bedrooms: 1,
      bathrooms: 1,
      nights: 1,
    }

    render(<PropertyCard property={singleProperty} />)

    expect(screen.getByText(/1 Guest/)).toBeInTheDocument()
    expect(screen.getByText(/1 Bedroom/)).toBeInTheDocument()
    expect(screen.getByText(/1 Bathroom/)).toBeInTheDocument()
    expect(screen.getByText(/1 Night/)).toBeInTheDocument()
  })

  it('does not display rating when rating is 0', () => {
    const propertyWithoutRating: Property = {
      ...mockProperty,
      rating: 0,
    }

    render(<PropertyCard property={propertyWithoutRating} />)

    expect(screen.queryByText(/⭐/)).not.toBeInTheDocument()
  })

  it('displays "Contact for pricing" when price is 0', () => {
    const propertyWithoutPrice: Property = {
      ...mockProperty,
      price: 0,
    }

    render(<PropertyCard property={propertyWithoutPrice} />)

    expect(screen.getByText('Contact for pricing')).toBeInTheDocument()
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument()
  })

  it('does not display nights when price is 0', () => {
    const propertyWithoutPrice: Property = {
      ...mockProperty,
      price: 0,
      nights: 3,
    }

    render(<PropertyCard property={propertyWithoutPrice} />)

    expect(screen.queryByText(/Nights/)).not.toBeInTheDocument()
  })

  it('does not display nights when nights is 0', () => {
    const propertyWithoutNights: Property = {
      ...mockProperty,
      nights: 0,
    }

    render(<PropertyCard property={propertyWithoutNights} />)

    expect(screen.getByText('$250')).toBeInTheDocument()
    expect(screen.queryByText(/Nights/)).not.toBeInTheDocument()
  })

  it('formats large prices with comma separators', () => {
    const expensiveProperty: Property = {
      ...mockProperty,
      price: 1250,
    }

    render(<PropertyCard property={expensiveProperty} />)

    expect(screen.getByText('$1,250')).toBeInTheDocument()
  })

  it('renders image dots for carousel indication', () => {
    const { container } = render(<PropertyCard property={mockProperty} />)

    const dots = container.querySelectorAll('.dot')
    expect(dots).toHaveLength(3)
    expect(dots[0]).toHaveClass('active')
  })
})
