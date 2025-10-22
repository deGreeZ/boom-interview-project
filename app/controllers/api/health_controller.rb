# app/controllers/api/health_controller.rb
module Api
  class HealthController < Api::BaseController
    def show
      render json: {
        status: "ok",
        timestamp: Time.current,
        version: "1.0.0",
        rails_version: Rails.version,
        ruby_version: RUBY_VERSION
      }
    end
  end
end
