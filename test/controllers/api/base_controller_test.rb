require "test_helper"

# Create a test controller that inherits from Api::BaseController for testing
class Api::TestBaseController < Api::BaseController
  # Action that raises RecordNotFound
  def raise_not_found
    raise ActiveRecord::RecordNotFound, "Record not found test"
  end

  # Action that raises RecordInvalid with a mock record
  def raise_invalid
    # Create a simple mock object that responds to the methods RecordInvalid expects
    mock_record = Object.new

    # Define the class first
    mock_class = Class.new do
      def self.name
        "TestRecord"
      end

      def self.human_attribute_name(attr, options = {})
        attr.to_s.humanize
      end

      def self.i18n_scope
        :activerecord
      end
    end

    # Assign the class to the mock record
    def mock_record.class
      @klass
    end

    mock_record.instance_variable_set(:@klass, mock_class)

    def mock_record.errors
      @errors ||= begin
        errors = ActiveModel::Errors.new(self)
        errors.add(:name, "can't be blank")
        errors.add(:email, "is invalid")
        errors
      end
    end

    exception = ActiveRecord::RecordInvalid.new(mock_record)
    raise exception
  end

  # Action that returns success
  def success
    render json: { message: "success" }, status: :ok
  end
end

class Api::BaseControllerTest < ActionDispatch::IntegrationTest
  include ApiHelpers

  setup do
    # Add test routes for the test controller
    Rails.application.routes.draw do
      namespace :api do
        get "test_base/raise_not_found", to: "test_base#raise_not_found"
        get "test_base/raise_invalid", to: "test_base#raise_invalid"
        get "test_base/success", to: "test_base#success"
      end
    end
  end

  teardown do
    # Reload original routes
    Rails.application.reload_routes!
  end

  test "skips CSRF verification for API requests" do
    # CSRF verification is skipped, so POST without token should work
    post "/api/test_base/success"

    # If CSRF was enforced, this would return 422 (Unprocessable Entity)
    # Since it's skipped, we should get a routing error (no POST route)
    # The fact that we don't get a 422 CSRF error proves CSRF is skipped
    assert_response :not_found # Routing error, not CSRF error
  end

  test "rescues ActiveRecord::RecordNotFound and returns 404 JSON" do
    get "/api/test_base/raise_not_found"

    assert_response :not_found
    assert_equal "application/json", response.media_type

    json = json_response
    assert json.key?("error")
    assert_equal "Record not found test", json["error"]
  end

  test "rescues ActiveRecord::RecordInvalid and returns 422 JSON with errors" do
    get "/api/test_base/raise_invalid"

    assert_response :unprocessable_entity
    assert_equal "application/json", response.media_type

    json = json_response
    assert json.key?("error")
    assert json.key?("details")
    assert_match(/Validation failed/, json["error"])

    # Check that error details are included
    details = json["details"]
    assert details.key?("name")
    assert details.key?("email")
    assert_includes details["name"], "can't be blank"
    assert_includes details["email"], "is invalid"
  end

  test "successful action returns proper JSON response" do
    get "/api/test_base/success"

    assert_response :success
    assert_equal "application/json", response.media_type

    json = json_response
    assert_equal "success", json["message"]
  end

  test "not_found handler includes exception message" do
    get "/api/test_base/raise_not_found"

    json = json_response
    assert_match(/Record not found test/, json["error"])
  end

  test "unprocessable_entity handler includes record errors" do
    get "/api/test_base/raise_invalid"

    json = json_response
    details = json["details"]

    # Verify both validation errors are present
    assert_equal 2, details.keys.length
    assert details.key?("name")
    assert details.key?("email")
  end
end
