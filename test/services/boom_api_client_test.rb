require "test_helper"

class BoomApiClientTest < ActiveSupport::TestCase
  include WebmockHelpers

  def setup
    # Clear singleton instance before each test
    BoomApiClient.instance_variable_set(:@singleton__instance__, nil)

    # Set up valid credentials
    @original_client_id = ENV["BOOM_API_CLIENT_ID"]
    @original_client_secret = ENV["BOOM_API_CLIENT_SECRET"]
    ENV["BOOM_API_CLIENT_ID"] = "test_client_id"
    ENV["BOOM_API_CLIENT_SECRET"] = "test_client_secret"
  end

  def teardown
    # Restore original credentials
    ENV["BOOM_API_CLIENT_ID"] = @original_client_id
    ENV["BOOM_API_CLIENT_SECRET"] = @original_client_secret

    # Clear singleton instance
    BoomApiClient.instance_variable_set(:@singleton__instance__, nil)
  end

  # Singleton pattern tests
  test "returns same instance on multiple calls" do
    instance1 = BoomApiClient.instance
    instance2 = BoomApiClient.instance

    assert_same instance1, instance2
  end

  test "raises error when client_id is missing" do
    ENV["BOOM_API_CLIENT_ID"] = nil

    error = assert_raises(BoomApiClient::AuthenticationError) do
      BoomApiClient.instance
    end

    assert_equal "Missing client_id or client_secret", error.message
  end

  test "raises error when client_secret is missing" do
    ENV["BOOM_API_CLIENT_SECRET"] = nil

    error = assert_raises(BoomApiClient::AuthenticationError) do
      BoomApiClient.instance
    end

    assert_equal "Missing client_id or client_secret", error.message
  end

  test "stores client credentials on initialization" do
    client = BoomApiClient.instance

    assert_equal "test_client_id", client.client_id
    assert_equal "test_client_secret", client.client_secret
  end

  # Authentication tests
  test "successfully authenticates with valid credentials" do
    stub_boom_authentication(token: "valid_token", expires_in: 3600)

    client = BoomApiClient.instance
    token = client.send(:authenticate)

    assert_equal "valid_token", token
    assert client.send(:token_valid?)
  end

  test "raises AuthenticationError on failed authentication" do
    stub_boom_authentication_failure

    client = BoomApiClient.instance

    error = assert_raises(BoomApiClient::AuthenticationError) do
      client.send(:authenticate)
    end

    assert_match(/Failed to authenticate: 401/, error.message)
  end

  test "raises AuthenticationError on invalid JSON response during auth" do
    stub_request(:post, "#{BOOM_API_BASE_URL}/auth/token")
      .to_return(status: 200, body: "invalid json {{{")

    client = BoomApiClient.instance

    error = assert_raises(BoomApiClient::AuthenticationError) do
      client.send(:authenticate)
    end

    assert_match(/Invalid JSON response/, error.message)
  end

  test "sets token expiration time correctly" do
    freeze_time do
      stub_boom_authentication(expires_in: 3600)

      client = BoomApiClient.instance
      client.send(:authenticate)

      expected_expiry = Time.current + 3600.seconds
      assert_equal expected_expiry, client.instance_variable_get(:@token_expires_at)
    end
  end

  # Token validation tests
  test "token_valid? returns true for valid unexpired token" do
    freeze_time do
      client = BoomApiClient.instance
      client.instance_variable_set(:@token, "valid_token")
      client.instance_variable_set(:@token_expires_at, Time.current + 300.seconds)

      assert client.send(:token_valid?)
    end
  end

  test "token_valid? returns false when token is nil" do
    client = BoomApiClient.instance
    client.instance_variable_set(:@token, nil)
    client.instance_variable_set(:@token_expires_at, Time.current + 3600.seconds)

    assert_not client.send(:token_valid?)
  end

  test "token_valid? returns false when expiration is nil" do
    client = BoomApiClient.instance
    client.instance_variable_set(:@token, "valid_token")
    client.instance_variable_set(:@token_expires_at, nil)

    assert_not client.send(:token_valid?)
  end

  test "token_valid? returns false when token is expired" do
    freeze_time do
      client = BoomApiClient.instance
      client.instance_variable_set(:@token, "expired_token")
      client.instance_variable_set(:@token_expires_at, Time.current - 1.second)

      assert_not client.send(:token_valid?)
    end
  end

  test "token_valid? returns false within 60 second buffer before expiration" do
    freeze_time do
      client = BoomApiClient.instance
      client.instance_variable_set(:@token, "soon_expired_token")
      client.instance_variable_set(:@token_expires_at, Time.current + 30.seconds)

      assert_not client.send(:token_valid?)
    end
  end

  # Access token management tests
  test "access_token returns existing valid token" do
    freeze_time do
      client = BoomApiClient.instance
      client.instance_variable_set(:@token, "cached_token")
      client.instance_variable_set(:@token_expires_at, Time.current + 3600.seconds)

      token = client.send(:access_token)

      assert_equal "cached_token", token
    end
  end

  test "access_token refreshes expired token" do
    freeze_time do
      stub_boom_authentication(token: "new_token")

      client = BoomApiClient.instance
      client.instance_variable_set(:@token, "old_token")
      client.instance_variable_set(:@token_expires_at, Time.current - 1.second)

      token = client.send(:access_token)

      assert_equal "new_token", token
    end
  end

  test "access_token authenticates when no token exists" do
    stub_boom_authentication(token: "first_token")

    client = BoomApiClient.instance
    token = client.send(:access_token)

    assert_equal "first_token", token
  end

  # get_cities tests
  test "get_cities returns array of cities" do
    stub_boom_authentication
    stub_boom_get_cities(cities: [ "San Francisco", "New York", "Boston" ])

    client = BoomApiClient.instance
    cities_data = client.get_cities

    assert_equal [ "San Francisco", "New York", "Boston" ], cities_data["cities"]
  end

  test "get_cities handles empty cities array" do
    stub_boom_authentication
    stub_boom_get_cities(cities: [])

    client = BoomApiClient.instance
    cities_data = client.get_cities

    assert_equal [], cities_data["cities"]
  end

  test "get_cities raises ApiError on API failure" do
    stub_boom_authentication
    stub_request(:get, "#{BOOM_API_BASE_URL}/listings/cities")
      .to_return(status: 500, body: "Internal Server Error")

    client = BoomApiClient.instance

    error = assert_raises(BoomApiClient::ApiError) do
      client.get_cities
    end

    assert_match(/API request failed: 500/, error.message)
  end

  test "get_cities raises ApiError on invalid JSON response" do
    stub_boom_authentication
    stub_request(:get, "#{BOOM_API_BASE_URL}/listings/cities")
      .to_return(status: 200, body: "not valid json")

    client = BoomApiClient.instance

    error = assert_raises(BoomApiClient::ApiError) do
      client.get_cities
    end

    assert_match(/Invalid JSON response/, error.message)
  end

  # get_listings tests
  test "get_listings returns listings without parameters" do
    stub_boom_authentication
    stub_boom_get_listings(listings: [ { id: 1, name: "Test Listing" } ])

    client = BoomApiClient.instance
    listings_data = client.get_listings

    assert_equal 1, listings_data["listings"].length
    assert_equal "Test Listing", listings_data["listings"][0]["name"]
  end

  test "get_listings accepts query parameters" do
    stub_boom_authentication
    stub_boom_get_listings(
      listings: [ { id: 1, city: "San Francisco" } ],
      params: { city: "San Francisco", adults: 2, bedrooms: 1 }
    )

    client = BoomApiClient.instance
    listings_data = client.get_listings(city: "San Francisco", adults: 2, bedrooms: 1)

    assert_equal 1, listings_data["listings"].length
    assert_equal "San Francisco", listings_data["listings"][0]["city"]
  end

  test "get_listings handles all supported parameters" do
    params = {
      adults: 2,
      bathrooms: 1,
      bedrooms: 2,
      check_in: "2024-01-01",
      check_out: "2024-01-05",
      children: 1,
      city: "Boston",
      lat: 42.3601,
      lng: -71.0589,
      nearby: true,
      page: 1,
      rad: 10,
      region: "MA"
    }

    stub_boom_authentication
    stub_boom_get_listings(listings: [], params: params)

    client = BoomApiClient.instance
    listings_data = client.get_listings(params)

    assert_equal [], listings_data["listings"]
  end

  test "get_listings raises ApiError on API failure" do
    stub_boom_authentication
    stub_request(:get, "#{BOOM_API_BASE_URL}/listings")
      .to_return(status: 404, body: "Not Found")

    client = BoomApiClient.instance

    error = assert_raises(BoomApiClient::ApiError) do
      client.get_listings
    end

    assert_match(/API request failed: 404/, error.message)
  end

  # HTTP method tests
  test "authenticated_request supports GET method" do
    stub_boom_authentication
    stub_request(:get, "#{BOOM_API_BASE_URL}/listings/cities")
      .to_return(status: 200, body: { cities: [] }.to_json)

    client = BoomApiClient.instance
    response = client.send(:authenticated_request, :get, "/listings/cities")

    assert_instance_of Net::HTTPOK, response
  end

  test "authenticated_request supports POST method" do
    stub_boom_authentication
    stub_request(:post, "#{BOOM_API_BASE_URL}/test")
      .to_return(status: 200, body: { success: true }.to_json)

    client = BoomApiClient.instance
    response = client.send(:authenticated_request, :post, "/test", { data: "test" })

    assert_instance_of Net::HTTPOK, response
  end

  test "authenticated_request supports PUT method" do
    stub_boom_authentication
    stub_request(:put, "#{BOOM_API_BASE_URL}/test")
      .to_return(status: 200, body: { success: true }.to_json)

    client = BoomApiClient.instance
    response = client.send(:authenticated_request, :put, "/test", { data: "test" })

    assert_instance_of Net::HTTPOK, response
  end

  test "authenticated_request supports DELETE method" do
    stub_boom_authentication
    stub_request(:delete, "#{BOOM_API_BASE_URL}/test")
      .to_return(status: 200, body: { success: true }.to_json)

    client = BoomApiClient.instance
    response = client.send(:authenticated_request, :delete, "/test")

    assert_instance_of Net::HTTPOK, response
  end

  test "authenticated_request raises ApiError for unsupported method" do
    stub_boom_authentication

    client = BoomApiClient.instance

    error = assert_raises(BoomApiClient::ApiError) do
      client.send(:authenticated_request, :patch, "/test")
    end

    assert_match(/Unsupported HTTP method: patch/, error.message)
  end

  test "authenticated_request includes authorization header" do
    stub_boom_authentication(token: "auth_token_123")
    stub_request(:get, "#{BOOM_API_BASE_URL}/listings/cities")
      .with(headers: { "Authorization" => "Bearer auth_token_123" })
      .to_return(status: 200, body: { cities: [] }.to_json)

    client = BoomApiClient.instance
    client.send(:authenticated_request, :get, "/listings/cities")

    assert_requested :get, "#{BOOM_API_BASE_URL}/listings/cities",
      headers: { "Authorization" => "Bearer auth_token_123" }, times: 1
  end

  test "authenticated_request encodes query parameters for GET" do
    stub_boom_authentication
    stub_request(:get, "#{BOOM_API_BASE_URL}/listings")
      .with(query: { city: "San Francisco", adults: "2" })
      .to_return(status: 200, body: { listings: [] }.to_json)

    client = BoomApiClient.instance
    response = client.send(:authenticated_request, :get, "/listings", { city: "San Francisco", adults: 2 })

    assert_instance_of Net::HTTPOK, response
  end

  test "authenticated_request sends JSON body for POST" do
    stub_boom_authentication
    stub_request(:post, "#{BOOM_API_BASE_URL}/test")
      .with(body: { data: "test_value" }.to_json)
      .to_return(status: 200, body: { success: true }.to_json)

    client = BoomApiClient.instance
    client.send(:authenticated_request, :post, "/test", { data: "test_value" })

    assert_requested :post, "#{BOOM_API_BASE_URL}/test",
      body: { data: "test_value" }.to_json, times: 1
  end

  test "authenticated_request raises ApiError on network error" do
    stub_boom_authentication
    stub_request(:get, "#{BOOM_API_BASE_URL}/listings/cities")
      .to_timeout

    client = BoomApiClient.instance

    error = assert_raises(BoomApiClient::ApiError) do
      client.get_cities
    end

    assert_match(/Request failed/, error.message)
  end

  test "authenticated_request re-raises AuthenticationError" do
    # First auth succeeds
    stub_boom_authentication(token: "valid_token")

    # Second auth (refresh) fails
    stub_request(:post, "#{BOOM_API_BASE_URL}/auth/token")
      .to_return(status: 401, body: "Unauthorized").times(1).then
      .to_return(status: 401, body: "Unauthorized")

    stub_request(:get, "#{BOOM_API_BASE_URL}/listings/cities")
      .to_return(status: 200, body: { cities: [] }.to_json)

    client = BoomApiClient.instance

    # Force token to be invalid to trigger re-authentication
    client.instance_variable_set(:@token, nil)

    # Stub will fail on second auth attempt
    BoomApiClient.instance_variable_set(:@singleton__instance__, nil)
    stub_boom_authentication_failure

    error = assert_raises(BoomApiClient::AuthenticationError) do
      BoomApiClient.instance.get_cities
    end

    assert_match(/Failed to authenticate/, error.message)
  end

  # parse_response tests
  test "parse_response successfully parses valid JSON" do
    stub_boom_authentication
    stub_request(:get, "#{BOOM_API_BASE_URL}/listings/cities")
      .to_return(status: 200, body: { data: "test" }.to_json)

    client = BoomApiClient.instance
    response = client.send(:authenticated_request, :get, "/listings/cities")
    parsed = client.send(:parse_response, response)

    assert_equal "test", parsed["data"]
  end

  test "parse_response raises ApiError on invalid JSON" do
    stub_boom_authentication
    stub_request(:get, "#{BOOM_API_BASE_URL}/listings/cities")
      .to_return(status: 200, body: "not valid json")

    client = BoomApiClient.instance

    error = assert_raises(BoomApiClient::ApiError) do
      client.get_cities
    end

    assert_match(/Invalid JSON response/, error.message)
  end

  # SSL configuration tests
  test "configure_http creates Net::HTTP instance" do
    uri = URI("https://example.com")
    client = BoomApiClient.instance
    http = client.send(:configure_http, uri)

    assert_instance_of Net::HTTP, http
    assert_equal "example.com", http.address
    assert_equal 443, http.port
  end

  test "authenticated_request uses HTTPS for API calls" do
    stub_boom_authentication
    stub_request(:get, "#{BOOM_API_BASE_URL}/listings/cities")
      .to_return(status: 200, body: { cities: [] }.to_json)

    client = BoomApiClient.instance
    response = client.send(:authenticated_request, :get, "/listings/cities")

    # Verify the response is successful
    assert_instance_of Net::HTTPOK, response
  end
end
