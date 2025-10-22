import { useState } from 'react';
import SearchWidget, { SearchParams } from '../components/SearchWidget';
import PropertyList from '../components/PropertyList';
import { Property } from '../components/PropertyCard';

// Mock property data
const mockProperties: Property[] = [
  {
    id: 1,
    name: 'The Nia Tower Ultimate Luxury Beach House',
    location: 'Pompano Beach',
    image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=400&fit=crop',
    rating: 5,
    guests: 12,
    bedrooms: 5,
    bathrooms: 4,
    price: 4869,
    nights: 7,
  },
  {
    id: 2,
    name: 'Bright Beachside Getaway Apt #7',
    location: 'Pompano Beach',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop',
    rating: 4.78,
    guests: 4,
    bedrooms: 1,
    bathrooms: 1.5,
    price: 1011,
    nights: 7,
  },
  {
    id: 3,
    name: 'Modern Downtown Loft',
    location: 'Hollywood',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=400&fit=crop',
    rating: 4.92,
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    price: 2145,
    nights: 7,
  },
  {
    id: 4,
    name: 'Cozy Beach Cottage',
    location: 'Deerfield Beach',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=400&fit=crop',
    rating: 4.85,
    guests: 8,
    bedrooms: 4,
    bathrooms: 3,
    price: 3200,
    nights: 7,
  },
  {
    id: 5,
    name: 'Luxury Waterfront Villa',
    location: 'Plantation',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=400&fit=crop',
    rating: 4.95,
    guests: 10,
    bedrooms: 5,
    bathrooms: 4,
    price: 5500,
    nights: 7,
  },
  {
    id: 6,
    name: 'Charming Studio by the Beach',
    location: 'Pompano Beach',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=400&fit=crop',
    rating: 4.65,
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    price: 850,
    nights: 7,
  },
];

export default function PropertySearch() {
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = (searchParams: SearchParams) => {
    setSearchPerformed(true);

    // Simple filtering based on location
    if (searchParams.location) {
      const filtered = mockProperties.filter((property) =>
        property.location.toLowerCase().includes(searchParams.location.toLowerCase())
      );
      setProperties(filtered);
    } else {
      setProperties(mockProperties);
    }
  };

  return (
    <div className="property-search-page">
      <SearchWidget onSearch={handleSearch} />

      <div className="property-search-content">
        {searchPerformed && (
          <div className="search-results-header">
            <h2>Found {properties.length} properties</h2>
          </div>
        )}

        <PropertyList properties={properties} />
      </div>
    </div>
  );
}
