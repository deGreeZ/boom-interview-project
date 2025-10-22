export interface Property {
  id: number;
  name: string;
  location: string;
  image: string;
  rating: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  price: number;
  nights: number;
}

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <div className="property-card">
      <div className="property-image-container">
        <img
          src={property.image}
          alt={property.name}
          className="property-image"
        />
        <div className="image-dots">
          <span className="dot active"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>

      <div className="property-details">
        <div className="property-header">
          <h3 className="property-name">
            {property.name}
            {property.rating > 0 && <span className="rating">⭐ {property.rating}</span>}
          </h3>
        </div>

        <div className="property-location">{property.location}</div>

        <div className="property-specs">
          {property.guests} Guest{property.guests !== 1 ? 's' : ''} | {property.bedrooms} Bedroom{property.bedrooms !== 1 ? 's' : ''} | {property.bathrooms} Bathroom{property.bathrooms !== 1 ? 's' : ''}
        </div>

        <div className="property-price">
          {property.price > 0 ? (
            <>
              <span className="price-amount">${property.price.toLocaleString()}</span>
              {property.nights > 0 && <span className="price-period"> · {property.nights} Night{property.nights !== 1 ? 's' : ''}</span>}
            </>
          ) : (
            <span className="price-amount">Contact for pricing</span>
          )}
        </div>
      </div>
    </div>
  );
}
