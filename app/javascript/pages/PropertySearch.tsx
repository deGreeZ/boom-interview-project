import { useState } from 'react';
import axios from 'axios';
import SearchWidget, { SearchParams } from '../components/SearchWidget';
import PropertyList from '../components/PropertyList';
import { Property } from '../components/PropertyCard';

export default function PropertySearch() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchParams: SearchParams) => {
    setSearchPerformed(true);
    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters for the API
      const params: Record<string, string | number> = {};

      if (searchParams.location) params.city = searchParams.location;
      if (searchParams.checkIn) params.check_in = searchParams.checkIn;
      if (searchParams.checkOut) params.check_out = searchParams.checkOut;
      if (searchParams.adults) params.adults = searchParams.adults;
      if (searchParams.children) params.children = searchParams.children;

      console.log('Search params:', searchParams);
      console.log('API params:', params);

      // Make API request to the listings endpoint
      const response = await axios.get('http://localhost:3000/api/boom/listings', {
        params,
      });

      console.log('API response:', response.data);

      // Calculate nights once
      const nights = calculateNights(searchParams.checkIn, searchParams.checkOut);
      console.log('Calculated nights:', nights, 'from', searchParams.checkIn, 'to', searchParams.checkOut);

      // Parse the API response and transform it to our Property interface
      const apiListings = response.data.listings || [];
      const transformedProperties: Property[] = apiListings.map((listing: any) => {
        // Extract price with fallbacks
        const price = listing.extra_info?.current_price?.total_price ||
                     listing.extra_info?.current_price?.our_price ||
                     listing.price ||
                     0;

        // Extract rating with fallbacks
        const rating = listing.rating ||
                      listing.average_rating ||
                      listing.star_rating ||
                      0;

        return {
          id: listing.id,
          name: listing.title || listing.name || 'Unnamed Property',
          location: listing.city_name || listing.city || searchParams.location,
          image: listing.picture || listing.pictures?.[0]?.original || 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=400&fit=crop',
          rating: rating,
          guests: listing.accommodates || 0,
          bedrooms: listing.beds || 0,
          bathrooms: listing.baths || 0,
          price: price,
          nights: nights,
        };
      });

      console.log('Transformed properties:', transformedProperties);
      setProperties(transformedProperties);
    } catch (err: any) {
      console.error('Error fetching listings:', err);
      setError(
        err.response?.data?.error ||
        'Failed to fetch listings. Please try again.'
      );
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateNights = (checkIn: string, checkOut: string): number => {
    if (!checkIn || !checkOut) {
      console.log('Missing dates:', { checkIn, checkOut });
      return 0;
    }

    try {
      const start = new Date(checkIn);
      const end = new Date(checkOut);

      // Check if dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.log('Invalid dates:', { checkIn, checkOut });
        return 0;
      }

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return nights;
    } catch (error) {
      console.error('Error calculating nights:', error);
      return 0;
    }
  };

  return (
    <div className="property-search-page">
      <SearchWidget onSearch={handleSearch} />

      <div className="property-search-content">
        {isLoading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Searching for properties...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p className="error-message">{error}</p>
            <button onClick={() => setError(null)} className="error-dismiss">
              Dismiss
            </button>
          </div>
        )}

        {!isLoading && !error && searchPerformed && (
          <>
            <div className="search-results-header">
              <h2>Found {properties.length} {properties.length === 1 ? 'property' : 'properties'}</h2>
            </div>
            <PropertyList properties={properties} />
          </>
        )}

        {!isLoading && !error && !searchPerformed && (
          <div className="no-search-state">
            <p>Enter your search criteria above to find properties</p>
          </div>
        )}
      </div>
    </div>
  );
}
