module Api
  class BoomController < BaseController
    before_action :initialize_client

    # GET /api/boom/cities
    # Returns list of available cities
    def cities
      cities = @client.get_cities
      render json: cities
    rescue BoomApiClient::AuthenticationError => e
      render json: { error: "Authentication failed: #{e.message}" }, status: :unauthorized
    rescue BoomApiClient::ApiError => e
      render json: { error: "API error: #{e.message}" }, status: :bad_gateway
    end

    # GET /api/boom/listings
    # Returns listings with optional filters
    # Query params: adults, bathrooms, bedrooms, check_in, check_out, children, city, lat, lng, nearby, page, rad, region
    def listings
      listings = @client.get_listings(listings_params)
      render json: listings
    rescue BoomApiClient::AuthenticationError => e
      render json: { error: "Authentication failed: #{e.message}" }, status: :unauthorized
    rescue BoomApiClient::ApiError => e
      render json: { error: "API error: #{e.message}" }, status: :bad_gateway
    end

    private

    def initialize_client
      @client = BoomApiClient.new
    end

    def listings_params
      params.permit(
        :adults,
        :bathrooms,
        :bedrooms,
        :check_in,
        :check_out,
        :children,
        :city,
        :lat,
        :lng,
        :nearby,
        :page,
        :rad,
        :region
      ).to_h.symbolize_keys
    end
  end
end
