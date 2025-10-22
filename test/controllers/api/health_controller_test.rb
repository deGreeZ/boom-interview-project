require "test_helper"

class Api::HealthControllerTest < ActionDispatch::IntegrationTest
  include ApiHelpers

  test "GET /api/health returns 200 OK" do
    get "/api/health"

    assert_response :success
  end

  test "GET /api/health returns JSON content type" do
    get "/api/health"

    assert_equal "application/json", response.media_type
  end

  test "GET /api/health includes status field" do
    get "/api/health"

    json = json_response
    assert json.key?("status")
    assert_equal "ok", json["status"]
  end

  test "GET /api/health includes timestamp field" do
    freeze_time do
      get "/api/health"

      json = json_response
      assert json.key?("timestamp")

      # Verify timestamp is a valid time string
      timestamp = Time.parse(json["timestamp"])
      assert_equal Time.current.to_i, timestamp.to_i
    end
  end

  test "GET /api/health includes version field" do
    get "/api/health"

    json = json_response
    assert json.key?("version")
    assert_equal "1.0.0", json["version"]
  end

  test "GET /api/health includes rails_version field" do
    get "/api/health"

    json = json_response
    assert json.key?("rails_version")
    assert_equal Rails.version, json["rails_version"]
  end

  test "GET /api/health includes ruby_version field" do
    get "/api/health"

    json = json_response
    assert json.key?("ruby_version")
    assert_equal RUBY_VERSION, json["ruby_version"]
  end

  test "GET /api/health returns all required fields" do
    get "/api/health"

    json = json_response
    expected_keys = %w[status timestamp version rails_version ruby_version]

    expected_keys.each do |key|
      assert json.key?(key), "Expected health response to include '#{key}'"
    end
  end

  test "GET /api/health timestamp is current time" do
    freeze_time do
      get "/api/health"

      json = json_response
      timestamp = Time.parse(json["timestamp"])

      # Allow 1 second tolerance for processing time
      assert_in_delta Time.current.to_f, timestamp.to_f, 1.0,
        "Health check timestamp should be current time"
    end
  end

  test "GET /api/health can be called multiple times" do
    3.times do
      get "/api/health"
      assert_response :success
    end
  end

  test "health endpoint is accessible without authentication" do
    # This tests that the endpoint doesn't require any auth headers
    get "/api/health", headers: {}

    assert_response :success
    json = json_response
    assert_equal "ok", json["status"]
  end
end
