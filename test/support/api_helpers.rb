module ApiHelpers
  # Parse JSON response body
  def json_response
    JSON.parse(response.body)
  end

  # Parse JSON response body with symbolized keys
  def json_response_symbolized
    JSON.parse(response.body, symbolize_names: true)
  end

  # Assert JSON response structure
  def assert_json_response(expected_keys: [])
    assert_equal "application/json", response.media_type
    parsed = json_response
    expected_keys.each do |key|
      assert parsed.key?(key.to_s), "Expected JSON response to have key '#{key}'"
    end
    parsed
  end

  # Assert successful JSON response
  def assert_successful_json_response(expected_keys: [])
    assert_response :success
    assert_json_response(expected_keys: expected_keys)
  end

  # Assert error JSON response
  def assert_error_json_response(status:, message: nil)
    assert_response status
    assert_equal "application/json", response.media_type
    parsed = json_response
    assert parsed.key?("error"), "Expected JSON response to have 'error' key"
    assert_equal message, parsed["error"] if message
    parsed
  end

  # Assert API returns 404 Not Found
  def assert_not_found_response(message: nil)
    assert_error_json_response(status: :not_found, message: message)
  end

  # Assert API returns 422 Unprocessable Entity
  def assert_unprocessable_entity_response
    assert_response :unprocessable_entity
    assert_equal "application/json", response.media_type
  end

  # Assert API returns 401 Unauthorized
  def assert_unauthorized_response(message: nil)
    assert_error_json_response(status: :unauthorized, message: message)
  end

  # Assert API returns 502 Bad Gateway
  def assert_bad_gateway_response(message: nil)
    assert_error_json_response(status: :bad_gateway, message: message)
  end

  # Make GET request and parse JSON response
  def get_json(path, **args)
    get path, **args
    json_response
  end

  # Make POST request and parse JSON response
  def post_json(path, **args)
    post path, **args
    json_response
  end

  # Set JSON request headers
  def json_headers
    { "Content-Type" => "application/json", "Accept" => "application/json" }
  end
end
