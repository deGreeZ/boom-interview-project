module WebmockHelpers
  # BoomNow API base URL
  BOOM_API_BASE_URL = "https://app.boomnow.com/open_api/v1"

  # Stub successful authentication request
  def stub_boom_authentication(token: "test_access_token", expires_in: 3600)
    stub_request(:post, "#{BOOM_API_BASE_URL}/auth/token")
      .to_return(
        status: 200,
        body: {
          access_token: token,
          token_type: "Bearer",
          expires_in: expires_in,
          created_at: Time.now.to_i
        }.to_json,
        headers: { "Content-Type" => "application/json" }
      )
  end

  # Stub failed authentication request
  def stub_boom_authentication_failure
    stub_request(:post, "#{BOOM_API_BASE_URL}/auth/token")
      .to_return(
        status: 401,
        body: { error: "invalid_client" }.to_json,
        headers: { "Content-Type" => "application/json" }
      )
  end

  # Stub successful cities request
  def stub_boom_get_cities(cities: [ "San Francisco", "New York", "Los Angeles" ])
    stub_request(:get, "#{BOOM_API_BASE_URL}/listings/cities")
      .to_return(
        status: 200,
        body: { cities: cities }.to_json,
        headers: { "Content-Type" => "application/json" }
      )
  end

  # Stub successful listings request
  def stub_boom_get_listings(listings: [], params: {})
    url = "#{BOOM_API_BASE_URL}/listings"

    # Stub both with and without query parameters to be flexible
    stub_request(:get, /#{Regexp.escape(url)}/)
      .to_return(
        status: 200,
        body: { listings: listings }.to_json,
        headers: { "Content-Type" => "application/json" }
      )
  end

  # Stub API error response
  def stub_boom_api_error(endpoint:, status: 500, message: "Internal Server Error")
    stub_request(:get, "#{BOOM_API_BASE_URL}/#{endpoint}")
      .to_return(
        status: status,
        body: { error: message }.to_json,
        headers: { "Content-Type" => "application/json" }
      )
  end

  # Stub network timeout
  def stub_boom_timeout(endpoint:)
    stub_request(:any, "#{BOOM_API_BASE_URL}/#{endpoint}")
      .to_timeout
  end

  # Stub invalid JSON response
  def stub_boom_invalid_json(endpoint:)
    stub_request(:get, "#{BOOM_API_BASE_URL}/#{endpoint}")
      .to_return(
        status: 200,
        body: "invalid json {{{",
        headers: { "Content-Type" => "application/json" }
      )
  end

  # Clear all BoomNow API stubs
  def clear_boom_stubs
    WebMock.reset!
  end
end
