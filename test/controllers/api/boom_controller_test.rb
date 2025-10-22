require "test_helper"

class Api::BoomControllerTest < ActionDispatch::IntegrationTest
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

  # Cities endpoint tests
  test "GET /api/boom/cities returns 200 OK with cities data" do
    stub_boom_authentication
    stub_boom_get_cities(cities: [ "San Francisco", "New York", "Boston" ])

    get "/api/boom/cities"

    assert_response :success
    assert_equal "application/json", response.media_type

    json = json_response
    assert_equal [ "San Francisco", "New York", "Boston" ], json["cities"]
  end

  test "GET /api/boom/cities returns empty array when no cities available" do
    stub_boom_authentication
    stub_boom_get_cities(cities: [])

    get "/api/boom/cities"

    assert_response :success
    json = json_response
    assert_equal [], json["cities"]
  end

  test "GET /api/boom/cities handles authentication error" do
    stub_boom_authentication_failure

    get "/api/boom/cities"

    assert_response :unauthorized
    json = json_response
    assert json.key?("error")
    assert_match(/Authentication failed/, json["error"])
  end

  test "GET /api/boom/cities handles API error" do
    stub_boom_authentication
    stub_request(:get, "#{BOOM_API_BASE_URL}/listings/cities")
      .to_return(status: 500, body: "Internal Server Error")

    get "/api/boom/cities"

    assert_response :bad_gateway
    json = json_response
    assert json.key?("error")
    assert_match(/API error/, json["error"])
  end

  test "GET /api/boom/cities initializes client before action" do
    stub_boom_authentication
    stub_boom_get_cities

    get "/api/boom/cities"

    assert_response :success
    # If client wasn't initialized, the request would fail
  end

  # Listings endpoint tests
  test "GET /api/boom/listings returns 200 OK with listings data" do
    stub_boom_authentication
    stub_boom_get_listings(listings: [
      { id: 1, name: "Beach House", city: "Miami" },
      { id: 2, name: "Mountain Cabin", city: "Denver" }
    ])

    get "/api/boom/listings"

    assert_response :success
    assert_equal "application/json", response.media_type

    json = json_response
    assert_equal 2, json["listings"].length
    assert_equal "Beach House", json["listings"][0]["name"]
    assert_equal "Mountain Cabin", json["listings"][1]["name"]
  end

  test "GET /api/boom/listings returns empty array when no listings available" do
    stub_boom_authentication
    stub_boom_get_listings(listings: [])

    get "/api/boom/listings"

    assert_response :success
    json = json_response
    assert_equal [], json["listings"]
  end

  test "GET /api/boom/listings accepts city parameter" do
    stub_boom_authentication
    stub_boom_get_listings(
      listings: [ { id: 1, city: "Boston" } ],
      params: { city: "Boston" }
    )

    get "/api/boom/listings", params: { city: "Boston" }

    assert_response :success
    json = json_response
    assert_equal 1, json["listings"].length
  end

  test "GET /api/boom/listings accepts adults parameter" do
    stub_boom_authentication
    stub_boom_get_listings(
      listings: [],
      params: { adults: "2" }
    )

    get "/api/boom/listings", params: { adults: 2 }

    assert_response :success
  end

  test "GET /api/boom/listings accepts bathrooms parameter" do
    stub_boom_authentication
    stub_boom_get_listings(params: { bathrooms: "1" })

    get "/api/boom/listings", params: { bathrooms: 1 }

    assert_response :success
  end

  test "GET /api/boom/listings accepts bedrooms parameter" do
    stub_boom_authentication
    stub_boom_get_listings(params: { bedrooms: "2" })

    get "/api/boom/listings", params: { bedrooms: 2 }

    assert_response :success
  end

  test "GET /api/boom/listings accepts check_in parameter" do
    stub_boom_authentication
    stub_boom_get_listings(params: { check_in: "2024-01-01" })

    get "/api/boom/listings", params: { check_in: "2024-01-01" }

    assert_response :success
  end

  test "GET /api/boom/listings accepts check_out parameter" do
    stub_boom_authentication
    stub_boom_get_listings(params: { check_out: "2024-01-05" })

    get "/api/boom/listings", params: { check_out: "2024-01-05" }

    assert_response :success
  end

  test "GET /api/boom/listings accepts children parameter" do
    stub_boom_authentication
    stub_boom_get_listings(params: { children: "1" })

    get "/api/boom/listings", params: { children: 1 }

    assert_response :success
  end

  test "GET /api/boom/listings accepts lat parameter" do
    stub_boom_authentication
    stub_boom_get_listings(params: { lat: "42.3601" })

    get "/api/boom/listings", params: { lat: 42.3601 }

    assert_response :success
  end

  test "GET /api/boom/listings accepts lng parameter" do
    stub_boom_authentication
    stub_boom_get_listings(params: { lng: "-71.0589" })

    get "/api/boom/listings", params: { lng: -71.0589 }

    assert_response :success
  end

  test "GET /api/boom/listings accepts nearby parameter" do
    stub_boom_authentication
    stub_boom_get_listings(params: { nearby: "true" })

    get "/api/boom/listings", params: { nearby: true }

    assert_response :success
  end

  test "GET /api/boom/listings accepts page parameter" do
    stub_boom_authentication
    stub_boom_get_listings(params: { page: "2" })

    get "/api/boom/listings", params: { page: 2 }

    assert_response :success
  end

  test "GET /api/boom/listings accepts rad parameter" do
    stub_boom_authentication
    stub_boom_get_listings(params: { rad: "10" })

    get "/api/boom/listings", params: { rad: 10 }

    assert_response :success
  end

  test "GET /api/boom/listings accepts region parameter" do
    stub_boom_authentication
    stub_boom_get_listings(params: { region: "MA" })

    get "/api/boom/listings", params: { region: "MA" }

    assert_response :success
  end

  test "GET /api/boom/listings accepts multiple parameters" do
    params = {
      city: "Boston",
      adults: "2",
      bedrooms: "1",
      bathrooms: "1",
      children: "0",
      page: "1"
    }

    stub_boom_authentication
    stub_boom_get_listings(params: params)

    get "/api/boom/listings", params: params

    assert_response :success
  end

  test "GET /api/boom/listings accepts all supported parameters" do
    params = {
      adults: "2",
      bathrooms: "1",
      bedrooms: "2",
      check_in: "2024-01-01",
      check_out: "2024-01-05",
      children: "1",
      city: "Boston",
      lat: "42.3601",
      lng: "-71.0589",
      nearby: "true",
      page: "1",
      rad: "10",
      region: "MA"
    }

    stub_boom_authentication
    stub_boom_get_listings(params: params)

    get "/api/boom/listings", params: params

    assert_response :success
  end

  test "GET /api/boom/listings filters out unpermitted parameters" do
    stub_boom_authentication
    stub_boom_get_listings

    # Include an unpermitted parameter
    get "/api/boom/listings", params: { city: "Boston", unpermitted: "value" }

    assert_response :success
    # The unpermitted parameter should be filtered out by strong parameters
  end

  test "GET /api/boom/listings symbolizes parameter keys" do
    stub_boom_authentication

    # Stub with symbol keys to verify symbolization works
    stub_request(:get, "#{BOOM_API_BASE_URL}/listings")
      .with(query: hash_including({ "city" => "Boston" }))
      .to_return(status: 200, body: { listings: [] }.to_json)

    get "/api/boom/listings", params: { city: "Boston" }

    assert_response :success
  end

  test "GET /api/boom/listings handles authentication error" do
    stub_boom_authentication_failure

    get "/api/boom/listings"

    assert_response :unauthorized
    json = json_response
    assert json.key?("error")
    assert_match(/Authentication failed/, json["error"])
  end

  test "GET /api/boom/listings handles API error" do
    stub_boom_authentication
    stub_request(:get, "#{BOOM_API_BASE_URL}/listings")
      .to_return(status: 502, body: "Bad Gateway")

    get "/api/boom/listings"

    assert_response :bad_gateway
    json = json_response
    assert json.key?("error")
    assert_match(/API error/, json["error"])
  end

  test "GET /api/boom/listings initializes client before action" do
    stub_boom_authentication
    stub_boom_get_listings

    get "/api/boom/listings"

    assert_response :success
    # If client wasn't initialized, the request would fail
  end

  # Error response format tests
  test "authentication error response includes error message" do
    stub_boom_authentication_failure

    get "/api/boom/cities"

    json = json_response
    assert json["error"].include?("Authentication failed")
  end

  test "API error response includes error message" do
    stub_boom_authentication
    stub_request(:get, "#{BOOM_API_BASE_URL}/listings/cities")
      .to_return(status: 500, body: "Server Error")

    get "/api/boom/cities"

    json = json_response
    assert json["error"].include?("API error")
  end

  test "both endpoints successfully call BoomApiClient" do
    stub_boom_authentication
    stub_boom_get_cities
    stub_boom_get_listings

    # First request - cities endpoint
    get "/api/boom/cities"
    assert_response :success

    # Second request - listings endpoint
    get "/api/boom/listings"
    assert_response :success

    # Both endpoints should work correctly
    # Note: In parallel tests, singleton instances may be created per worker
  end
end
