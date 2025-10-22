require "test_helper"

class Api::HealthCheckTest < ActionDispatch::IntegrationTest
  include ApiHelpers

  test "health check endpoint is accessible" do
    get "/api/health"

    assert_response :success
    assert_equal "application/json", response.media_type
  end

  test "health check returns complete health information" do
    freeze_time do
      get "/api/health"

      json = json_response

      # Verify all expected fields are present
      assert_equal "ok", json["status"]
      assert_not_nil json["timestamp"]
      assert_equal "1.0.0", json["version"]
      assert_equal Rails.version, json["rails_version"]
      assert_equal RUBY_VERSION, json["ruby_version"]
    end
  end

  test "health check works without authentication" do
    get "/api/health"

    assert_response :success
    json = json_response
    assert_equal "ok", json["status"]
  end

  test "health check responds with JSON content type" do
    get "/api/health"

    # Should have proper JSON content type header
    assert_equal "application/json", response.media_type
    assert_response :success
  end

  test "health check endpoint responds quickly" do
    start_time = Time.current

    get "/api/health"

    response_time = Time.current - start_time

    assert_response :success
    # Health check should respond in less than 100ms
    assert response_time < 0.1, "Health check took too long: #{response_time}s"
  end

  test "health check can be called repeatedly without issues" do
    10.times do
      get "/api/health"
      assert_response :success
    end
  end

  test "health check response is consistent across requests" do
    freeze_time do
      get "/api/health"
      first_response = json_response

      get "/api/health"
      second_response = json_response

      # Responses should be identical when time is frozen
      assert_equal first_response["status"], second_response["status"]
      assert_equal first_response["version"], second_response["version"]
      assert_equal first_response["rails_version"], second_response["rails_version"]
      assert_equal first_response["ruby_version"], second_response["ruby_version"]
    end
  end
end
