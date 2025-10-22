require "test_helper"

class SpaControllerTest < ActionDispatch::IntegrationTest
  test "GET / returns 200 OK" do
    get "/"

    assert_response :success
  end

  test "GET / renders HTML content" do
    get "/"

    assert_equal "text/html", response.media_type
  end

  test "GET / renders with application layout" do
    get "/"

    assert_response :success
    # The layout should include the HTML structure
    assert_select "html"
    assert_select "body"
  end

  test "GET / includes Vite JavaScript entrypoint" do
    get "/"

    # The application layout should include Vite tags
    assert_match(/vite/, response.body.downcase)
  end

  test "catch-all route renders React app for unknown paths" do
    get "/unknown/path/that/does/not/exist"

    assert_response :success
    assert_equal "text/html", response.media_type
  end

  test "catch-all route works for nested paths" do
    get "/some/deeply/nested/path"

    assert_response :success
    assert_equal "text/html", response.media_type
  end

  test "API routes are not caught by SPA controller" do
    # API routes should not be handled by SPA controller
    # This is handled by Rails routing, but we can verify the routes exist
    get "/api/health"

    assert_response :success
    assert_equal "application/json", response.media_type
  end

  test "SPA controller serves same response for different client-side routes" do
    # All non-API routes should serve the same React app
    paths = [ "/", "/about", "/listings", "/nested/route" ]

    responses = paths.map do |path|
      get path
      assert_response :success
      response.body
    end

    # All responses should be identical (same HTML shell)
    # Note: This assumes all paths render the same React app shell
    first_response = responses.first
    responses.each do |response_body|
      assert_equal first_response, response_body,
        "All SPA routes should serve identical HTML shell"
    end
  end

  test "SPA controller does not render JSON" do
    get "/"

    assert_not_equal "application/json", response.media_type
    assert_equal "text/html", response.media_type
  end

  test "root path is handled by SPA controller" do
    get "/"

    assert_response :success
    # Verify it's handled by SpaController by checking for HTML response
    assert_match(/<html/, response.body)
  end

  test "SPA controller response includes DOCTYPE" do
    get "/"

    assert_match(/<!DOCTYPE html>/i, response.body)
  end

  test "SPA controller response includes head section" do
    get "/"

    assert_select "head"
  end

  test "SPA controller response includes meta tags" do
    get "/"

    assert_select "meta[name='viewport']"
  end
end
