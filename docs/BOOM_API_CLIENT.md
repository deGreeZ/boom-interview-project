# BoomAPI Client Documentation

The BoomAPI client provides a Ruby interface for interacting with the BoomNow API. It handles authentication, token management, and provides methods for accessing listings and cities data.

## Setup

### 1. Configure API Credentials

Copy `.env.example` to `.env` and add your BoomNow API credentials:

```bash
cp .env.example .env
```

Then edit `.env` and add your credentials:

```env
BOOM_API_CLIENT_ID=your_client_id_here
BOOM_API_CLIENT_SECRET=your_client_secret_here
```

**Note:** The `.env` file is already in `.gitignore` to prevent accidentally committing credentials.

### 2. Alternative: Use Rails Credentials

For production, you can use Rails encrypted credentials instead of environment variables:

```bash
bin/rails credentials:edit
```

Add your credentials:

```yaml
boom_api:
  client_id: your_client_id_here
  client_secret: your_client_secret_here
```

Then update the client initialization in your code:

```ruby
client = BoomApiClient.new(
  client_id: Rails.application.credentials.boom_api[:client_id],
  client_secret: Rails.application.credentials.boom_api[:client_secret]
)
```

## Usage

### Direct Usage in Ruby Code

```ruby
# Initialize the client
client = BoomApiClient.new

# Get list of available cities
cities = client.get_cities
# => ["new york", "los angeles", ...]

# Get all listings
listings = client.get_listings

# Get listings with filters
listings = client.get_listings(
  city: "Hollywood",
  adults: 2,
  children: 1,
  bedrooms: 2,
  bathrooms: 1,
  check_in: "2025-01-01",
  check_out: "2025-01-05",
  page: 1
)

# Search by location coordinates
listings = client.get_listings(
  lat: 34.0522,
  lng: -118.2437,
  rad: 10,  # radius in miles or km
  nearby: true
)

# Search by region
listings = client.get_listings(
  region: "South"
)
```

### Using the API Endpoints

The application provides proxy endpoints for the BoomNow API:

#### Get Cities

```bash
GET /api/boom/cities
```

Response:
```json
{
  "cities": ["new york", "los angeles", ...]
}
```

#### Get Listings

```bash
GET /api/boom/listings?city=Hollywood&adults=2&bedrooms=2
```

**Query Parameters:**
- `adults` (integer) - Number of adult guests
- `bathrooms` (integer) - Minimum number of bathrooms
- `bedrooms` (integer) - Minimum number of bedrooms
- `check_in` (string) - Check-in date (format: "YYYY-MM-DD")
- `check_out` (string) - Check-out date (format: "YYYY-MM-DD")
- `children` (integer) - Number of guests under 18
- `city` (string) - City name
- `lat` (number) - Nearby latitude
- `lng` (number) - Nearby longitude
- `nearby` (boolean) - lng, lat & rad are required if nearby is true
- `page` (integer) - Page number
- `rad` (number) - Nearby radius
- `region` (string) - Region name

Response:
```json
{
  "listings": [
    {
      "listing": {
        "id": 0,
        "title": "string",
        "pictures": [...],
        "picture": "string",
        "nickname": "string",
        "amenities": ["string"],
        "marketing_content": {
          "notes": "string",
          "space": "string",
          "access": "string"
        }
      }
    }
  ]
}
```

### Example: Using in a Rails Controller

```ruby
class MyController < ApplicationController
  def search_properties
    client = BoomApiClient.new

    @listings = client.get_listings(
      city: params[:city],
      adults: params[:adults],
      bedrooms: params[:bedrooms]
    )

    render json: @listings
  rescue BoomApiClient::AuthenticationError => e
    render json: { error: "Authentication failed" }, status: :unauthorized
  rescue BoomApiClient::ApiError => e
    render json: { error: "API error occurred" }, status: :bad_gateway
  end
end
```

### Example: Using in a Background Job

```ruby
class FetchListingsJob < ApplicationJob
  queue_as :default

  def perform(city)
    client = BoomApiClient.new
    listings = client.get_listings(city: city)

    # Process listings...
  end
end
```

## Features

### Automatic Token Management

The client automatically:
- Requests an access token on first use
- Caches the token until expiration
- Refreshes the token when it expires
- Includes the Bearer token in all API requests

### Error Handling

The client raises specific exceptions for different error scenarios:

- `BoomApiClient::AuthenticationError` - Failed to authenticate with the API
- `BoomApiClient::ApiError` - API request failed or returned an error

Example:

```ruby
begin
  listings = client.get_listings(city: "Hollywood")
rescue BoomApiClient::AuthenticationError => e
  # Handle authentication failure
  Rails.logger.error "BoomAPI auth failed: #{e.message}"
rescue BoomApiClient::ApiError => e
  # Handle API errors
  Rails.logger.error "BoomAPI request failed: #{e.message}"
end
```

## API Reference

### BoomApiClient

#### Methods

##### `initialize(client_id: nil, client_secret: nil)`

Creates a new BoomAPI client instance.

- `client_id` - API client ID (defaults to `ENV['BOOM_API_CLIENT_ID']`)
- `client_secret` - API client secret (defaults to `ENV['BOOM_API_CLIENT_SECRET']`)

Raises `AuthenticationError` if credentials are missing.

##### `get_cities`

Returns an array of available city names.

**Returns:** `Array<String>`

**Example:**
```ruby
cities = client.get_cities
# => ["new york", "los angeles", ...]
```

##### `get_listings(params = {})`

Returns listings matching the specified filters.

**Parameters:**
- `params` (Hash) - Query parameters for filtering listings

**Returns:** `Hash` - Listings data with nested structure

**Example:**
```ruby
listings = client.get_listings(city: "Hollywood", adults: 2)
```

## Testing

You can test the client in the Rails console:

```bash
bin/rails console
```

```ruby
# Initialize client
client = BoomApiClient.new

# Test authentication
client.send(:authenticate)

# Test get_cities
cities = client.get_cities
puts cities.inspect

# Test get_listings
listings = client.get_listings(city: cities.first)
puts listings.inspect
```

## Troubleshooting

### "Missing client_id or client_secret" error

Make sure you've:
1. Created a `.env` file from `.env.example`
2. Added your actual API credentials
3. Restarted the Rails server

### Authentication failures

Verify that:
- Your credentials are correct
- The BoomNow API service is accessible
- You have a valid internet connection

### API errors

Check:
- The API endpoint is available
- Request parameters are valid
- You're not exceeding rate limits
