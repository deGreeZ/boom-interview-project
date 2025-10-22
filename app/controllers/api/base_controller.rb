# app/controllers/api/base_controller.rb
module Api
  class BaseController < ApplicationController
    # Skip CSRF verification for API requests
    # In production, you should use token-based authentication
    skip_before_action :verify_authenticity_token

    # Handle common exceptions
    rescue_from ActiveRecord::RecordNotFound, with: :not_found
    rescue_from ActiveRecord::RecordInvalid, with: :unprocessable_entity

    private

    def not_found(exception)
      render json: { error: exception.message }, status: :not_found
    end

    def unprocessable_entity(exception)
      render json: { error: exception.message, details: exception.record.errors }, status: :unprocessable_entity
    end
  end
end
