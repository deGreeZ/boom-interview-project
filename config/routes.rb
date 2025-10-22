Rails.application.routes.draw do
  # Health check endpoint
  get "up" => "rails/health#show", as: :rails_health_check

  # API routes
  namespace :api do
    resource :health, only: [ :show ]
    # Add your API endpoints here
    # Example:
    # resources :posts, only: [ :index, :show, :create, :update, :destroy ]
  end

  # Catch-all route for React SPA
  # This must be the last route as it will match all paths not matched above
  get "*path", to: "spa#index", constraints: ->(request) do
    # Don't match API routes, Rails health check, or asset requests
    !request.path.start_with?("/api", "/up", "/rails/", "/assets/", "/vite/", "/vite-dev/")
  end

  # Root route
  root "spa#index"
end
