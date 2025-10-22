# BoomAPI Client for interacting with BoomNow API
# Handles authentication, token management, and API requests
class BoomApiClient
  class AuthenticationError < StandardError; end
  class ApiError < StandardError; end

  BASE_URL = "https://app.boomnow.com/open_api/v1"

  attr_reader :client_id, :client_secret

  def initialize(client_id: nil, client_secret: nil)
    @client_id = client_id || ENV["BOOM_API_CLIENT_ID"]
    @client_secret = client_secret || ENV["BOOM_API_CLIENT_SECRET"]
    @token = nil
    @token_expires_at = nil

    raise AuthenticationError, "Missing client_id or client_secret" if @client_id.nil? || @client_secret.nil?
  end

  # Get list of available cities
  # @return [Array<String>] Array of city names
  def get_cities
    response = authenticated_request(:get, "/listings/cities")
    parse_response(response)
  end

  # Get listings with optional filters
  # @param params [Hash] Query parameters (adults, bathrooms, bedrooms, check_in, check_out, children, city, lat, lng, nearby, page, rad, region)
  # @return [Hash] Listings data with nested structure
  def get_listings(params = {})
    response = authenticated_request(:get, "/listings", params)
    parse_response(response)
  end

  private

  # Authenticate and get access token
  # @return [String] Access token
  def authenticate
    uri = URI("#{BASE_URL}/auth/token")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE

    request = Net::HTTP::Post.new(uri.path, {
      "Content-Type" => "application/json",
      "Accept" => "application/json"
    })

    request.body = {
      client_id: @client_id,
      client_secret: @client_secret
    }.to_json

    response = http.request(request)

    unless response.is_a?(Net::HTTPSuccess)
      raise AuthenticationError, "Failed to authenticate: #{response.code} - #{response.body}"
    end

    data = JSON.parse(response.body)
    @token = data["access_token"]
    @token_expires_at = Time.current + data["expires_in"].to_i.seconds

    @token
  rescue JSON::ParserError => e
    raise AuthenticationError, "Invalid JSON response: #{e.message}"
  end

  # Check if token is valid and not expired
  # @return [Boolean]
  def token_valid?
    @token.present? && @token_expires_at.present? && Time.current < @token_expires_at
  end

  # Get valid token, refreshing if necessary
  # @return [String] Valid access token
  def access_token
    return @token if token_valid?
    authenticate
  end

  # Make an authenticated API request
  # @param method [Symbol] HTTP method (:get, :post, etc.)
  # @param path [String] API endpoint path
  # @param params [Hash] Query parameters or request body
  # @return [Net::HTTPResponse]
  def authenticated_request(method, path, params = {})
    uri = URI("#{BASE_URL}#{path}")

    if method == :get && params.any?
      uri.query = URI.encode_www_form(params.compact)
    end

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE

    request_class = case method
    when :get then Net::HTTP::Get
    when :post then Net::HTTP::Post
    when :put then Net::HTTP::Put
    when :delete then Net::HTTP::Delete
    else raise ArgumentError, "Unsupported HTTP method: #{method}"
    end

    request = request_class.new(uri.request_uri, {
      "Authorization" => "Bearer #{access_token}",
      "Accept" => "application/json",
      "Content-Type" => "application/json"
    })

    if method != :get && params.any?
      request.body = params.to_json
    end

    response = http.request(request)

    unless response.is_a?(Net::HTTPSuccess)
      raise ApiError, "API request failed: #{response.code} - #{response.body}"
    end

    response
  rescue AuthenticationError => e
    raise e
  rescue StandardError => e
    raise ApiError, "Request failed: #{e.message}"
  end

  # Parse JSON response
  # @param response [Net::HTTPResponse]
  # @return [Hash, Array]
  def parse_response(response)
    JSON.parse(response.body)
  rescue JSON::ParserError => e
    raise ApiError, "Invalid JSON response: #{e.message}"
  end
end
