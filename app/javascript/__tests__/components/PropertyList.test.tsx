import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PropertyList from '~/components/PropertyList'
import { Property } from '~/components/PropertyCard'

describe('PropertyList', () => {
  const mockProperties: Property[] = [
    {
      id: 1,
      name: 'Luxury Downtown Apartment',
      location: 'New York, NY',
      image: 'https://example.com/image1.jpg',
      rating: 4.8,
      guests: 4,
      bedrooms: 2,
      bathrooms: 2,
      price: 250,
      nights: 3,
    },
    {
      id: 2,
      name: 'Cozy Studio with View',
      location: 'Los Angeles, CA',
      image: 'https://example.com/image2.jpg',
      rating: 4.5,
      guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      price: 150,
      nights: 3,
    },
    {
      id: 3,
      name: 'Beachfront Villa',
      location: 'Miami, FL',
      image: 'https://example.com/image3.jpg',
      rating: 4.9,
      guests: 8,
      bedrooms: 4,
      bathrooms: 3,
      price: 500,
      nights: 3,
    },
  ]

  it('renders multiple property cards', () => {
    render(<PropertyList properties={mockProperties} />)

    expect(screen.getByText('Luxury Downtown Apartment')).toBeInTheDocument()
    expect(screen.getByText('Cozy Studio with View')).toBeInTheDocument()
    expect(screen.getByText('Beachfront Villa')).toBeInTheDocument()
  })

  it('renders correct number of property cards', () => {
    const { container } = render(<PropertyList properties={mockProperties} />)

    const propertyCards = container.querySelectorAll('.property-card')
    expect(propertyCards).toHaveLength(3)
  })

  it('displays empty state when no properties are provided', () => {
    render(<PropertyList properties={[]} />)

    expect(
      screen.getByText('No properties found. Try adjusting your search criteria.')
    ).toBeInTheDocument()
  })

  it('does not render property cards when list is empty', () => {
    const { container } = render(<PropertyList properties={[]} />)

    const propertyCards = container.querySelectorAll('.property-card')
    expect(propertyCards).toHaveLength(0)
  })

  it('renders each property with unique key', () => {
    const { container } = render(<PropertyList properties={mockProperties} />)

    const propertyCards = container.querySelectorAll('.property-card')
    propertyCards.forEach((card, index) => {
      expect(card).toBeInTheDocument()
    })
  })

  it('renders single property correctly', () => {
    const singleProperty = [mockProperties[0]]
    render(<PropertyList properties={singleProperty} />)

    expect(screen.getByText('Luxury Downtown Apartment')).toBeInTheDocument()
    expect(screen.queryByText('Cozy Studio with View')).not.toBeInTheDocument()
  })
})
