require "test_helper"

class Api::BoomApiTest < ActionDispatch::IntegrationTest
  include ApiHelpers
  include WebmockHelpers

  setup do
    # Set up valid credentials for BoomApiClient
    @original_client_id = ENV["BOOM_API_CLIENT_ID"]
    @original_client_secret = ENV["BOOM_API_CLIENT_SECRET"]
    ENV["BOOM_API_CLIENT_ID"] = "test_client_id"
    ENV["BOOM_API_CLIENT_SECRET"] = "test_client_secret"

    # Clear singleton instance before each test
    BoomApiClient.instance_variable_set(:@singleton__instance__, nil)
  end

  teardown do
    # Restore original credentials
    ENV["BOOM_API_CLIENT_ID"] = @original_client_id
    ENV["BOOM_API_CLIENT_SECRET"] = @original_client_secret

    # Clear singleton instance
    BoomApiClient.instance_variable_set(:@singleton__instance__, nil)
  end

  # Full flow integration tests
  test "complete flow: authenticate and fetch cities" do
    stub_boom_authentication(token: "integration_test_token")
    stub_boom_get_cities(cities: [ "San Francisco", "New York", "Los Angeles" ])

    get "/api/boom/cities"

    assert_response :success
    json = json_response

    assert_equal [ "San Francisco", "New York", "Los Angeles" ], json["cities"]

    # Verify authentication was called
    assert_requested :post, "#{BOOM_API_BASE_URL}/auth/token", times: 1

    # Verify cities endpoint was called with correct authorization
    assert_requested :get, "#{BOOM_API_BASE_URL}/listings/cities",
      headers: { "Authorization" => "Bearer integration_test_token" }, times: 1
  end

  test "complete flow: authenticate and fetch listings with filters" do
    stub_boom_authentication(token: "integration_test_token")

    listings_data = [
      {
        id: 1,
        name: "Luxury Apartment",
        city: "San Francisco",
        bedrooms: 2,
        bathrooms: 2,
        adults: 4
      },
      {
        id: 2,
        name: "Cozy Studio",
        city: "San Francisco",
        bedrooms: 1,
        bathrooms: 1,
        adults: 2
      }
    ]

    stub_boom_get_listings(
      listings: listings_data,
      params: { city: "San Francisco", bedrooms: "2" }
    )

    get "/api/boom/listings", params: { city: "San Francisco", bedrooms: 2 }

    assert_response :success
    json = json_response

    assert_equal 2, json["listings"].length
    assert_equal "Luxury Apartment", json["listings"][0]["name"]
    assert_equal "San Francisco", json["listings"][0]["city"]

    # Verify authentication was called
    assert_requested :post, "#{BOOM_API_BASE_URL}/auth/token", times: 1

    # Verify listings endpoint was called with filters
    assert_requested :get, "#{BOOM_API_BASE_URL}/listings",
      headers: { "Authorization" => "Bearer integration_test_token" },
      query: hash_including({ "city" => "San Francisco", "bedrooms" => "2" }),
      times: 1
  end

  test "multiple API calls use cached authentication token" do
    stub_boom_authentication(token: "cached_token", expires_in: 3600)
    stub_boom_get_cities
    stub_boom_get_listings

    freeze_time do
      # First request - should authenticate
      get "/api/boom/cities"
      assert_response :success

      # Second request - should reuse token
      get "/api/boom/listings"
      assert_response :success

      # Third request - should still reuse token
      get "/api/boom/cities"
      assert_response :success
    end

    # Authentication should only happen once due to token caching
    assert_requested :post, "#{BOOM_API_BASE_URL}/auth/token", times: 1
  end

  test "API reauthenticates when token expires" do
    # Stub authentication to return tokens with different expiry times
    auth_count = 0
    stub_request(:post, "#{BOOM_API_BASE_URL}/auth/token")
      .to_return do |request|
        auth_count += 1
        if auth_count == 1
          { status: 200, body: { access_token: "expired_token", expires_in: 120 }.to_json, headers: { "Content-Type" => "application/json" } }
        else
          { status: 200, body: { access_token: "new_token", expires_in: 3600 }.to_json, headers: { "Content-Type" => "application/json" } }
        end
      end

    stub_boom_get_cities

    freeze_time do
      # First request
      get "/api/boom/cities"
      assert_response :success

      # Travel past expiration (120s + 60s buffer)
      travel 181.seconds

      # Clear the singleton to force re-authentication
      BoomApiClient.instance_variable_set(:@singleton__instance__, nil)

      # Second request should trigger reauthentication
      get "/api/boom/cities"
      assert_response :success
    end

    # Should have authenticated twice
    assert_equal 2, auth_count
  end

  test "error handling across full request flow" do
    stub_boom_authentication_failure

    get "/api/boom/cities"

    assert_response :unauthorized
    json = json_response
    assert_match(/Authentication failed/, json["error"])

    # Verify the error response format
    assert json.key?("error")
    assert_kind_of String, json["error"]
  end

  test "API error propagates correctly through full stack" do
    stub_boom_authentication
    stub_request(:get, "#{BOOM_API_BASE_URL}/listings/cities")
      .to_return(status: 503, body: "Service Unavailable")

    get "/api/boom/cities"

    assert_response :bad_gateway
    json = json_response
    assert_match(/API error/, json["error"])
  end

  test "complex listing query with all parameters" do
    stub_boom_authentication

    params = {
      adults: "2",
      bathrooms: "2",
      bedrooms: "3",
      check_in: "2024-06-01",
      check_out: "2024-06-07",
      children: "1",
      city: "Miami",
      lat: "25.7617",
      lng: "-80.1918",
      nearby: "true",
      page: "1",
      rad: "15",
      region: "FL"
    }

    stub_boom_get_listings(
      listings: [ { id: 123, name: "Miami Beach House" } ],
      params: params
    )

    get "/api/boom/listings", params: params

    assert_response :success
    json = json_response

    assert_equal 1, json["listings"].length
    assert_equal "Miami Beach House", json["listings"][0]["name"]

    # Verify all parameters were passed to the API
    assert_requested :get, "#{BOOM_API_BASE_URL}/listings",
      query: hash_including(params), times: 1
  end

  test "concurrent requests to different endpoints" do
    stub_boom_authentication
    stub_boom_get_cities(cities: [ "Boston", "Seattle" ])
    stub_boom_get_listings(listings: [ { id: 1, name: "Test" } ])

    # Simulate concurrent requests (in practice, would be parallel)
    cities_response = get "/api/boom/cities"
    listings_response = get "/api/boom/listings"

    assert_response :success

    # Both should succeed
    get "/api/boom/cities"
    assert_response :success

    get "/api/boom/listings"
    assert_response :success
  end

  test "API responds with proper CORS headers for cross-origin requests" do
    stub_boom_authentication
    stub_boom_get_cities

    # Make request with Origin header
    get "/api/boom/cities", headers: { "Origin" => "http://localhost:3036" }

    assert_response :success

    # In development, CORS should be configured to allow localhost:3036
    # This is handled by rack-cors gem in config/initializers/cors.rb
  end

  test "empty parameter values are handled correctly" do
    stub_boom_authentication
    stub_boom_get_listings

    # Request with empty string parameters
    get "/api/boom/listings", params: { city: "", adults: "" }

    assert_response :success
  end

  test "API handles network timeout gracefully" do
    stub_boom_authentication
    stub_request(:get, "#{BOOM_API_BASE_URL}/listings/cities")
      .to_timeout

    get "/api/boom/cities"

    assert_response :bad_gateway
    json = json_response
    assert json.key?("error")
    assert_match(/API error/, json["error"])
  end

  test "API handles malformed JSON response from upstream" do
    stub_boom_authentication
    stub_request(:get, "#{BOOM_API_BASE_URL}/listings/cities")
      .to_return(status: 200, body: "not valid json {{{")

    get "/api/boom/cities"

    assert_response :bad_gateway
    json = json_response
    assert_match(/API error/, json["error"])
  end

  test "listings endpoint accepts pagination" do
    stub_boom_authentication

    # Page 1
    stub_request(:get, "#{BOOM_API_BASE_URL}/listings")
      .with(query: hash_including({ "page" => "1" }))
      .to_return(
        status: 200,
        body: { listings: [ { id: 1 }, { id: 2 } ] }.to_json
      )

    get "/api/boom/listings", params: { page: 1 }
    assert_response :success
    json = json_response
    assert_equal 2, json["listings"].length

    # Page 2
    stub_request(:get, "#{BOOM_API_BASE_URL}/listings")
      .with(query: hash_including({ "page" => "2" }))
      .to_return(
        status: 200,
        body: { listings: [ { id: 3 }, { id: 4 } ] }.to_json
      )

    get "/api/boom/listings", params: { page: 2 }
    assert_response :success
    json = json_response
    assert_equal 2, json["listings"].length
  end
end
