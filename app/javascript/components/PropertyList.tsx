import PropertyCard, { Property } from './PropertyCard';

interface PropertyListProps {
  properties: Property[];
}

export default function PropertyList({ properties }: PropertyListProps) {
  if (properties.length === 0) {
    return (
      <div className="no-results">
        <p>No properties found. Try adjusting your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="property-list">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
